# Helm-Analytics

**A privacy-first, open-source web analytics platform.**  
Get the insights you need without compromising user privacy.

![GitHub Repo stars](https://img.shields.io/github/stars/Sentinel-Analytics/sentinel-mvp?style=social)
![GitHub issues](https://img.shields.io/github/issues/Sentinel-Analytics/sentinel-mvp)
![GitHub forks](https://img.shields.io/github/forks/Sentinel-Analytics/sentinel-mvp)
![GitHub license](https://img.shields.io/github/license/Sentinel-Analytics/sentinel-mvp)
![Docker Image Size](https://img.shields.io/docker/image-size/library/alpine/latest?label=docker)

---

## ✨ Key Features (MVP v1)

- 👤 **Multi-User & Multi-Site**: Manage multiple websites from a single, secure account.
- 📊 **Essential Analytics**: Unique Visitors, Page Views, Bounce Rate, Average Visit Time, Top Pages, and Top Referrers.
- 🌍 **Visitor Insights**: Reports on Browser, Operating System, and Country.
- 📅 **Date Filtering**: Analyze traffic over the last 24 hours, 7 days, or 30 days.
- 🚀 **Incredibly Lightweight**: Tracking script is tiny (<2KB) and won’t slow down your site.
- 🔒 **100% Self-Hosted**: Run on your own infrastructure with Docker. You own your data, always.

---

## 🚀 Quick Start (One-Click Deployment)

Get your own **Helm-Analytics** instance running in under 5 minutes.

### Prerequisites
- A server (VPS or home server) with **docker** and **docker-compose** installed.  
- The **GeoLite2-Country.mmdb** file downloaded from MaxMind.

### 1. Clone the Repository
```bash
git clone https://github.com/Sentinel-Analytics/sentinel-mvp.git
cd sentinel-mvp
```

### 2. Place GeoIP Database
Place your downloaded **GeoLite2-Country.mmdb** file in the root of this project directory.

### 3. Configure Environment
Create a `.env` file in the project root with your database connection details:

```env
DATABASE_URL=postgres://sentinel:your_super_secret_password@db:5432/sentinel?sslmode=disable
```

Update your `docker-compose.yml` to match the password you chose for the `POSTGRES_PASSWORD` variable.

### 4. Run the Application
```bash
docker compose up --build -d
```

### 5. You're Live! 🎉
- **Create Your Admin Account:** Go to `http://your-server-ip:8000/signup`  
- **Log In:** Go to `http://your-server-ip:8000/login`  

---

## 🔮 What's Next? The Road to v2

This MVP is just the beginning. Our vision for Helm-Analytics is to be a complete website intelligence platform. Coming in v2:

- 🛡️ **Traffic Quality Score & Bot Detection** – Go beyond simple numbers and detect real human traffic.  
- 🔥 **Real-Time Firewall** – Block malicious traffic from specific countries, data centers (ASNs), and known bots.  
- ⚡ **Core Web Vitals** – Monitor site performance and its impact on user experience directly in your dashboard.  

---

## 🤝 Community & Feedback

Helm-Analytics is built for the community, by the community. Your feedback is invaluable in shaping the future of this project.

- 🐛 **Report a Bug:** Open an issue on GitHub.  
- 💡 **Request a Feature:** Start a discussion in the feature requests section.  
- 💬 **Join the Conversation:** (Coming Soon) Discord server for chat, support, and announcements.  

---

## ❤️ Support the Project

If you find Helm-Analytics useful and want to support its continued development:

- ⭐ **Star the project** on GitHub — the easiest and most impactful way to show support!  
- ☕ **Buy me a coffee** — small donations fuel development and are greatly appreciated.  

---

## 📜 License

This project is licensed under the **MIT License**.
