import os
import tweepy
import google.generativeai as genai
from sqlmodel import Session, select
from models import engine, TwitterAuth, DraftTweet
from datetime import datetime, timedelta

# Setup Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

PROMPT_CONTEXT = """
You are the official social media manager for 'Helm Analytics'. 
Helm Analytics is a privacy-first, ultra-fast, open-source web analytics platform and a core pillar of the 'KriB Ecosystem'.

Categories:
1. EDUCATION: Contrast GA4 privacy issues with Helm's data sovereignty.
2. FEATURE: Highlight 'Sub-second ClickHouse ingestion' or 'Native Session Replays'.
3. PROMOTION: Mention 'Helm Cloud' and use a placeholder [DISCOUNT_CODE] for 20% off.
4. ENGAGEMENT: Ask developers/marketers a thought-provoking question about data.
5. ECOSYSTEM: Explain how Helm verifies human intent via the KriB verification layer.

Tone: Authoritative, developer-friendly, forward-thinking, and bold.
Limits: Under 280 characters. Max 1-2 relevant hashtags. Max 1-2 emojis.

Generate a unique tweet for the category: {category}.
Only return the raw tweet text.
"""

def get_twitter_client():
    with Session(engine) as session:
        auth = session.exec(select(TwitterAuth)).first()
        if not auth:
            return None
        
        # Initialize client with OAuth 2.0 User Context
        return tweepy.Client(
            client_id=os.getenv("TWITTER_CLIENT_ID"),
            client_secret=os.getenv("TWITTER_CLIENT_SECRET"),
            access_token=auth.access_token
        )

def generate_ai_tweet(category: str = "EDUCATION", feedback: str = None):
    prompt = PROMPT_CONTEXT.format(category=category)
    if feedback:
        prompt += f"\nNote: Re-generate this {category} tweet based on user feedback: '{feedback}'."
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating {category} tweet: {e}")
        return None

def post_tweet(tweet_id: int):
    with Session(engine) as session:
        draft = session.get(DraftTweet, tweet_id)
        if not draft or draft.status != "approved":
            return False, "Draft not found or not approved"
        
        # In a real scenario, we'd use the saved access token
        # For now, we simulate or use the client if initialized
        client = get_twitter_client()
        if not client:
            return False, "Twitter not authenticated. Please visit /twitter/login"
            
        try:
            # Actual post to X (Twitter)
            response = client.create_tweet(text=draft.content)
            
            # Update status on success
            draft.status = "posted"
            draft.posted_at = datetime.utcnow()
            session.add(draft)
            session.commit()
            
            return True, f"Successfully posted! Tweet ID: {response.data['id']}"
        except Exception as e:
            return False, f"X Error: {str(e)}"
