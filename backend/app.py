from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from db.twitterDB import TwitterDB, Tweet, User
from routes import twitter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:5173",  # React app's URL during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


app.include_router(twitter.router, prefix="/api")
