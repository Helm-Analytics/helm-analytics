import os
import time
import schedule
import tweepy
import google.generativeai as genai
from datetime import datetime

# ==========================================
# 🚀 HELM ANALYTICS X (TWITTER) BOT
# ==========================================

# 1. Setup Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY environment variable")
genai.configure(api_key=GEMINI_API_KEY)

# Use Gemini 1.5 Flash (fast and cost-effective)
model = genai.GenerativeModel('gemini-1.5-flash')

# 2. Setup Twitter (X) API via Tweepy (v2 API)
# You need to create an app in the Twitter Developer Portal and get these keys
CLIENT_ID = os.getenv("TWITTER_CLIENT_ID")
CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET")
API_KEY = os.getenv("TWITTER_API_KEY")
API_SECRET = os.getenv("TWITTER_API_SECRET")
ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN")
ACCESS_SECRET = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")

# Initialize Tweepy Client (OAuth 1.0a User Context is needed for posting)
try:
    twitter_client = tweepy.Client(
        consumer_key=API_KEY,
        consumer_secret=API_SECRET,
        access_token=ACCESS_TOKEN,
        access_token_secret=ACCESS_SECRET
    )
except Exception as e:
    print(f"Warning: Twitter credentials not fully configured. {e}")

# 3. Define the Persona & Strategy Plan
# The prompt context ensures consistency
PROMPT_CONTEXT = """
You are the official social media manager for 'Helm Analytics'. 
Helm Analytics is a privacy-first, ultra-fast, open-source web analytics platform.
It is a core pillar of the 'KriB Ecosystem', providing real-time website intelligence (session replays, heatmaps, funnels) while masking sensitive PII natively.

Your goal is to write a single, highly engaging, professional yet bold tweet (under 280 characters).
Do NOT include hashtags unless they are extremely relevant (max 1 or 2).
Do NOT use emojis excessively (1 or 2 max).
Make the tone authoritative, developer-friendly, and forward-thinking.
Vary the topics based on this overall plan:
- Post 1 (Awareness): The importance of privacy-safe analytics vs Google Analytics.
- Post 2 (Features): Highlight a specific feature (e.g., Session Replays, Heatmaps, Bot Detection with Clickhouse).
- Post 3 (Ecosystem): Mention how Helm Analytics integrates with Vendor AI / FindKriB within the KriB Ecosystem to verify genuine human traffic.
- Post 4 (Open Source): Promote the self-hosted Community Edition (AGPLv3) and the ease of docker deployment.

Generate a completely unique tweet for exactly ONE of these topics (choose randomly or cycle). 
Just return the raw text of the tweet, nothing else.
"""

def generate_tweet():
    try:
        response = model.generate_content(PROMPT_CONTEXT)
        tweet_text = response.text.strip()
        
        # Ensure it fits Twitter limits
        if len(tweet_text) > 280:
            tweet_text = tweet_text[:277] + "..."
            
        # Clean up quotes if Gemini accidentally wraps it
        if tweet_text.startswith('"') and tweet_text.endswith('"'):
            tweet_text = tweet_text[1:-1]
            
        return tweet_text
    except Exception as e:
        print(f"❌ Error generating tweet with Gemini: {e}")
        return None

def post_to_twitter():
    print(f"\n⏳ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Waking up to post...")
    
    tweet_text = generate_tweet()
    if not tweet_text:
        return
        
    print(f"📝 Generated Draft:\n{tweet_text}\n")
    
    try:
        # Note: In production with valid credentials, uncomment the next line:
        # response = twitter_client.create_tweet(text=tweet_text)
        # print(f"✅ Success! Tweet ID: {response.data['id']}")
        
        print("🚀 (Simulated) Successfully posted to X!")
    except Exception as e:
        print(f"❌ Failed to post to X: {e}")

# 4. Schedule the Job (Every 15 minutes)
schedule.every(15).minutes.do(post_to_twitter)

if __name__ == "__main__":
    print("🤖 Helm Analytics X Bot starting up...")
    print("Press Ctrl+C to exit.\n")
    
    # Run once immediately on startup
    post_to_twitter()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(1)
