from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Define the allowed origins
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")  # Get allowed origins from .env or default to localhost
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_123")  # Use the SECRET_KEY from .env or fallback
DB_URL = os.getenv("DB_URL", "sqlite:///./test.db")  # Use the DB_URL from .env or default to a local SQLite database

# Add CORS middleware to allow requests from the specified origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "CORS and Dotenv configured successfully!",
        "allowed_origins": origins,
        "db_url": DB_URL
    }

