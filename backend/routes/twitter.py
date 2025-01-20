from fastapi import Query
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Path
from bson import ObjectId
from db.twitterDB import TwitterDB, Tweet, User, Keyword
from typing import List
import time
import re

twitter_db = TwitterDB()
router = APIRouter(prefix="/twitter")

patterns = {
    'twitter_keyword_pattern': r'^[a-zA-Z0-9" \u0590-\u05FF\u0600-\u06FF]{1,15}$',
    'twitter_username_pattern': r'^@[a-zA-Z0-9_]{1,15}$',
    'twitter_user_id_pattern': r'^[a-zA-Z0-9]{1,20}$'
}


# ---------------- Admin Pannel - Users ----------------


@router.post("/add_user/{username}", response_model=User)
async def add_monitored_user(username: str):
    # validate user
    users = await twitter_db.get_users()
    if not re.match(patterns["twitter_username_pattern"], username):
        raise HTTPException(
            status_code=400, detail="Incorrect username format")
    username = username[1:]
    if any([user['username'] == username for user in users]):
        raise HTTPException(
            status_code=409, detail="User already exists")

    user = {
        "name": None,
        "username": username,
        "id": None,
        "profile_image_url": None,
        "last_scan": time.time() - (24 * 60 * 60)
    }
    result = await twitter_db.insert_user(user)
    _id = result.upserted_id
    return {**user, "_id": str(_id)}


# TODO change to _id and post
@router.get("/remove_user/{username}")
async def remove_monitored_user(username: str):
    await twitter_db.remove_user(username)
    return {"message": f"{username} removed successfully"}


@router.get("/monitored_users", response_model=List[User])
async def get_monitored_twitter_users():
    return await twitter_db.get_users()


# ---------------- Admin Pannel - Keywords ----------------


@router.get("/keywords", response_model=List[Keyword])
async def get_twitter_keywords():
    return await twitter_db.get_keywords()


@router.post("/add_keyword/{keyword}", response_model=Keyword)
async def add_keyword(keyword: str):
    # validate keyword
    keywords = await twitter_db.get_keywords()
    if not re.match(patterns["twitter_keyword_pattern"], keyword):
        raise HTTPException(
            status_code=400, detail="Incorrect keyword format")
    if any([_keyword['keyword'] == keyword for _keyword in keywords]):
        raise HTTPException(
            status_code=409, detail="Keyword already exists")

    keyword = {
        "keyword": keyword,
        "last_scan": time.time() - (24 * 60 * 60)
    }
    result = await twitter_db.insert_keyword(keyword)
    _id = result.upserted_id
    return {**keyword, "_id": str(_id)}


@router.post("/delete_keyword/{document_id}")
async def delete_keyword(document_id: str = Path(..., title="Document ID", description="Valid MongoDB ObjectId")):
    # Validate if the document_id is a valid ObjectId
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=400, detail="Invalid document ID format."
        )

    # Check if the document exists
    keyword = await twitter_db.get_keyword_by_id(document_id)
    if not keyword:
        raise HTTPException(
            status_code=404, detail=f"Keyword with ID {document_id} not found."
        )

    # Perform the deletion
    await twitter_db.delete_keyword(document_id)
    return {"message": f"Keyword with ID {document_id} successfully deleted."}


# ---------------- Tweets ----------------


@router.get("/tweets", response_model=List[Tweet])
async def get_tweets(status: Optional[int] = None, cursor: Optional[float] = None, user_id: Optional[str] = None,
                     keyword: Optional[List[str]] = Query(None), search: Optional[str] = None):
    if status is not None:
        if status < 0 or status >= 3:
            raise HTTPException(
                status_code=400, detail="Invalid status format. Allowed values: 0, 1, 2."
            )
    if user_id:
        if not re.match(patterns["twitter_user_id_pattern"], user_id):
            raise HTTPException(
                status_code=400, detail="Invalid user_id format."
            )
    if keyword:
        for kw in keyword:
            if not re.match(patterns["twitter_keyword_pattern"], kw):
                raise HTTPException(
                    status_code=400, detail=f"Invalid keyword format: {kw}"
                )
    if search:
        if not re.match(patterns["twitter_keyword_pattern"], search):
            raise HTTPException(
                status_code=400, detail="Invalid search format."
            )

    tweets = await twitter_db.get_tweets(status=status, date_limit=cursor, keywords=keyword,
                                         user_id=user_id, search=search)
    return tweets


# TODO change to post and validate
@router.get("/approve/{document_id}")
async def approve_tweet(document_id: str = Path(..., title="Document ID", description="Valid MongoDB ObjectId")):
    # Validate if the document_id is a valid ObjectId
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=400, detail="Invalid document ID format."
        )
    await twitter_db.delete_tweet(document_id)
    return {"message": "Tweet approved successfully"}


# validate tweet_id
@router.post("/update_tweet_status/{tweet_id}")
async def update_tweet_status(tweet_id: str, status: int):
    # Validate status
    if not isinstance(status, int) or status < 0 or status > 9:
        raise HTTPException(
            status_code=400, detail="Status must be exactly one numeric digit.")

    result = await twitter_db.update_tweet_status(tweet_id, status)
    if result.modified_count > 0:
        return {"message": f"Tweet {tweet_id} status updated to {status}."}
    return {"message": f"Tweet {tweet_id} not found or status is already {status}."}
