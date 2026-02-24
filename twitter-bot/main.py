import os
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from datetime import datetime, timedelta
import tweepy
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager

from models import engine, create_db_and_tables, DraftTweet, TwitterAuth
from bot_logic import generate_ai_tweet, post_tweet

# --- Configuration ---
CLIENT_ID = os.getenv("TWITTER_CLIENT_ID")
CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET")
REDIRECT_URI = os.getenv("TWITTER_REDIRECT_URI", "http://localhost:8080/twitter/callback")
SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_db_and_tables()
    scheduler.start()
    yield
    # Shutdown logic
    scheduler.shutdown()

app = FastAPI(title="Helm Analytics Twitter Bot", lifespan=lifespan)

# --- Scheduler Setup ---
CAMPAIGN_CATEGORIES = ["EDUCATION", "FEATURE", "PROMOTION", "ENGAGEMENT", "ECOSYSTEM"]
category_index = 0

def auto_generate_draft(category: str = None):
    global category_index
    with Session(engine) as session:
        # Use provided category or rotate through the list
        current_cat = category or CAMPAIGN_CATEGORIES[category_index % len(CAMPAIGN_CATEGORIES)]
        
        # Generate a new draft
        content = generate_ai_tweet(category=current_cat)
        if content:
            new_draft = DraftTweet(content=content)
            session.add(new_draft)
            session.commit()
            print(f"🤖 Auto-generated [{current_cat}] draft: {content[:50]}...")
            
            # Increment index for next time if we're in auto-mode
            if not category:
                category_index += 1

scheduler = BackgroundScheduler()
# 5 posts a day = approx every 4.8 hours (288 minutes)
scheduler.add_job(auto_generate_draft, 'interval', minutes=288)

# --- Endpoints ---

@app.get("/drafts")
def get_drafts():
    with Session(engine) as session:
        drafts = session.exec(select(DraftTweet).where(DraftTweet.status == "pending")).all()
        return drafts

@app.post("/drafts/generate")
def force_generate(category: str = None):
    auto_generate_draft(category=category)
    return {"message": f"Draft generation triggered for {category or 'next rotation category'}"}

@app.post("/drafts/{tweet_id}/approve")
def approve_and_post(tweet_id: int):
    with Session(engine) as session:
        draft = session.get(DraftTweet, tweet_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        draft.status = "approved"
        session.add(draft)
        session.commit()
    
    success, message = post_tweet(tweet_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"message": "Tweet approved and posted successfully"}

@app.post("/drafts/{tweet_id}/reject")
def reject_draft(tweet_id: int, feedback: str = None):
    with Session(engine) as session:
        draft = session.get(DraftTweet, tweet_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        draft.status = "rejected"
        draft.feedback = feedback
        session.add(draft)
        session.commit()
    
    # Optionally trigger a new generation with this feedback
    if feedback:
        new_content = generate_ai_tweet(feedback=feedback)
        if new_content:
            new_draft = DraftTweet(content=new_content)
            session.add(new_draft)
            session.commit()
            
    return {"message": "Draft rejected", "feedback_recorded": True}

# --- Twitter Auth Flow ---

@app.get("/twitter/login")
def twitter_login():
    oauth2_handler = tweepy.OAuth2UserHandler(
        client_id=CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        scope=SCOPES,
        client_secret=CLIENT_SECRET
    )
    auth_url = oauth2_handler.get_authorization_url()
    return RedirectResponse(auth_url)

@app.get("/twitter/callback")
async def twitter_callback(code: str, state: str = None):
    oauth2_handler = tweepy.OAuth2UserHandler(
        client_id=CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        scope=SCOPES,
        client_secret=CLIENT_SECRET
    )
    
    try:
        access_token = oauth2_handler.fetch_token(code)
        # access_token is a dict containing access_token, refresh_token, expires_at
        
        with Session(engine) as session:
            # Overwrite or create the first auth record
            auth = session.get(TwitterAuth, 1) or TwitterAuth(id=1)
            auth.access_token = access_token['access_token']
            auth.refresh_token = access_token['refresh_token']
            auth.expires_at = datetime.utcnow() + timedelta(seconds=access_token['expires_in'])
            session.add(auth)
            session.commit()
            
        return {"message": "Successfully authenticated with X! You can now approve drafts."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch token: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
