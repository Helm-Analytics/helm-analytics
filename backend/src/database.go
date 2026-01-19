package sentinel

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

// ... (InitDB and createTables are unchanged) ...
func InitDB() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %q", err)
	}
	for i := 0; i < 5; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Printf("Database not ready, retrying in 2 seconds... (%v)", err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("Could not connect to the database after several retries: %q", err)
	}
	log.Println("Successfully connected to the database.")
	createTables()
}

func createTables() {
	enableExtension := `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
	if _, err := db.Exec(enableExtension); err != nil {
		log.Fatalf("Could not enable pgcrypto extension: %v", err)
	}
	createUsersTable := `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
	if _, err := db.Exec(createUsersTable); err != nil {
		log.Fatalf("Could not create users table: %v", err)
	}
	// Migration for plan
	db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';`)
	// Migration for full_name
	db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;`)
	createSitesTable := `
    CREATE TABLE IF NOT EXISTS sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        domain TEXT,
        shield_mode BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
	if _, err := db.Exec(createSitesTable); err != nil {
		log.Fatalf("Could not create sites table: %v", err)
	}
	// Migration for shield_mode
	db.Exec(`ALTER TABLE sites ADD COLUMN IF NOT EXISTS shield_mode BOOLEAN DEFAULT FALSE;`)

	createFirewallRulesTable := `
    CREATE TABLE IF NOT EXISTS firewall_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        rule_type TEXT NOT NULL, -- e.g., "ip", "country", "asn"
        value TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
	if _, err := db.Exec(createFirewallRulesTable); err != nil {
		log.Fatalf("Could not create firewall_rules table: %v", err)
	}
	// Migration for reason
	db.Exec(`ALTER TABLE firewall_rules ADD COLUMN IF NOT EXISTS reason TEXT;`)
	createFunnelsTable := `
    CREATE TABLE IF NOT EXISTS funnels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        steps JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`
	if _, err := db.Exec(createFunnelsTable); err != nil {
		log.Fatalf("Could not create funnels table: %v", err)
	}
	log.Println("Database tables are set up.")
}


// --- AUTHENTICATION & PAGE HANDLERS ---

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("sentinel_session")
		if err != nil {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		userID, err := strconv.Atoi(cookie.Value)
		if err != nil || userID == 0 {
			http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}


func SignupPageHandler(w http.ResponseWriter, r *http.Request) {
	// This will now be handled by the React frontend router
	// This function can be removed if you don't need a direct server-side route
}

func LoginPageHandler(w http.ResponseWriter, r *http.Request) {
    // This will now be handled by the React frontend router
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	email := strings.ToLower(strings.TrimSpace(creds.Email))
	password := creds.Password

	if email == "" || password == "" {
		http.Error(w, `{"error": "Email and password cannot be empty"}`, http.StatusBadRequest)
		return
	}

	hashedPassword, err := hashPassword(password)
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}
	var userID int
	err = db.QueryRow("INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id", email, hashedPassword, creds.Name).Scan(&userID)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, `{"error": "Could not create user (email might be taken)"}`, http.StatusBadRequest)
		} else {
			log.Printf("Error creating user: %v", err)
			http.Error(w, `{"error": "An unexpected error occurred"}`, http.StatusInternalServerError)
		}
		return
	}

	// Set session cookie upon successful signup
	http.SetCookie(w, &http.Cookie{
		Name:     "sentinel_session",
		Value:    strconv.Itoa(userID),
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true, // Important for cross-domain
		SameSite: http.SameSiteNoneMode,
		Domain:   ".helm-analytics.com", // Set to the parent domain
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

// CORRECTED LoginHandler
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	email := strings.ToLower(strings.TrimSpace(creds.Email))
	password := creds.Password

	var storedHash string
	var userID int
	err := db.QueryRow("SELECT id, password_hash FROM users WHERE email = $1", email).Scan(&userID, &storedHash)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, `{"error": "User not found"}`, http.StatusUnauthorized)
		} else {
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		}
		return
	}
	if !checkPasswordHash(password, storedHash) {
		http.Error(w, `{"error": "Incorrect password"}`, http.StatusUnauthorized)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "sentinel_session",
		Value:    strconv.Itoa(userID),
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true, // Important for cross-domain
		SameSite: http.SameSiteNoneMode,
		Domain:   ".helm-analytics.com", // Set to the parent domain
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "sentinel_session",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Domain:   ".helm-analytics.com",
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out"})
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	// This will be handled by the React app's routing
}

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query("SELECT id, email, created_at FROM users")
	if err != nil {
		http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type User struct {
		ID        int       `json:"id"`
		Email     string    `json:"email"`
		CreatedAt time.Time `json:"created_at"`
	}

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Email, &user.CreatedAt); err != nil {
			http.Error(w, `{"error": "Internal server error"}`, http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// InitDemoHandler creates/ensures demo user exists and returns credentials
func InitDemoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" && r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	demoEmail := "demo@helm-analytics.com"
	demoPassword := "demo123"

	// Check if demo user exists
	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE email = $1", demoEmail).Scan(&userID)
	
	if err == sql.ErrNoRows {
		// Create demo user
		hashedPassword, err := hashPassword(demoPassword)
		if err != nil {
			log.Printf("Error hashing demo password: %v", err)
			http.Error(w, `{"error": "Failed to initialize demo"}`, http.StatusInternalServerError)
			return
		}

		err = db.QueryRow(
			"INSERT INTO users (email, password_hash, full_name, plan) VALUES ($1, $2, $3, $4) RETURNING id",
			demoEmail, hashedPassword, "Demo User", "pro",
		).Scan(&userID)
		
		if err != nil {
			log.Printf("Error creating demo user: %v", err)
			http.Error(w, `{"error": "Failed to create demo user"}`, http.StatusInternalServerError)
			return
		}

		log.Printf("✅ Demo user created with ID: %d", userID)
	} else if err != nil {
		log.Printf("Error querying demo user: %v", err)
		http.Error(w, `{"error": "Database error"}`, http.StatusInternalServerError)
		return
	}

	// Set session cookie for demo user
	http.SetCookie(w, &http.Cookie{
		Name:     "sentinel_session",
		Value:    strconv.Itoa(userID),
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Domain:   ".helm-analytics.com",
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Demo initialized successfully",
		"user_id": userID,
		"email":   demoEmail,
	})
}
