from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from datetime import datetime

class DraftTweet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    status: str = "pending"  # pending, approved, rejected, posted
    created_at: datetime = Field(default_factory=datetime.utcnow)
    scheduled_at: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    feedback: Optional[str] = None
    is_thread: bool = False

class TwitterAuth(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    access_token: str
    refresh_token: str
    expires_at: datetime

sqlite_url = "sqlite:///./bot_data.db"
engine = create_engine(sqlite_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
