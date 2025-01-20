import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
import time


class TwitterDB:
    def __init__(self):
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client.twitter
        self.keywords = db.keywords
        self.tweets = db.tweets
        self.users = db.users

    async def insert_tweet(self, tweet_dict: dict):
        return await self.tweets.insert_one(tweet_dict)

    async def insert_user(self, user_dict: dict):
        return await self.users.update_one(
            filter={"username": user_dict["username"]},
            update={"$setOnInsert": user_dict},
            upsert=True
        )

    async def remove_user(self, username_or_userid: str):
        user = await self.users.find_one({"$or": [{"username": username_or_userid}, {"userid": username_or_userid}]})
        await self.users.delete_one({"_id": user["_id"]})

    def id_to_str(self, item):
        if item:
            item["_id"] = str(item["_id"])
        return item

    async def get_tweets(
        self,
        status: int = None,
        date_limit: float = None,
        user_id: str = None,
        keywords: list = None,
        search: str = None
    ):
        if date_limit is None:
            date_limit = time.time()

        query = {"created_at": {"$lt": date_limit}}

        if user_id:
            query["user.id"] = user_id

        if keywords:
            query["keyword"] = {"$in": keywords}

        if search:
            # Case-insensitive search
            query["$text"] = {"$search": search}

        if status:
            query["status"] = status

        frame_size = 10
        tweets_cursor = self.tweets.find(query).sort(
            "created_at", -1).limit(frame_size)
        tweets = await tweets_cursor.to_list(length=frame_size)

        return [self.id_to_str(tweet) for tweet in tweets]

    async def get_users(self):
        users_cursor = self.users.find({})
        users = await users_cursor.to_list()

        return [self.id_to_str(user) for user in users]

    async def get_keywords(self):
        keywords_cursor = self.keywords.find({})
        keywords = await keywords_cursor.to_list()
        return [self.id_to_str(keyword) for keyword in keywords]

    async def get_keyword_by_id(self, _id):
        return await self.keywords.find_one({"_id": ObjectId(_id)})

    async def delete_keyword(self, _id: str):
        await self.keywords.delete_one({"_id": ObjectId(_id)})

    async def insert_keyword(self, keyword_dict: dict):
        return await self.keywords.update_one(
            filter={"keyword": keyword_dict["keyword"]},
            update={"$setOnInsert": keyword_dict},
            upsert=True
        )

    async def delete_tweet(self, _id):
        await self.tweets.delete_one({"_id": ObjectId(_id)})

    async def update_tweet_status(self, tweet_id, status):
        filter_criteria = {"tweet_id": tweet_id}
        update_data = {"$set": {"status": status}}
        result = await self.tweets.update_one(filter_criteria, update_data)
        return result


class User(BaseModel):
    _id: str
    name: str | None
    username: str | None
    last_scan: float | None = None
    id: str | None
    profile_image_url: str | None
    monitored: bool = True


class Tweet(BaseModel):
    document_id: str = Field(alias="_id")
    user: User
    tweet_id: str
    created_at: float
    text: str
    keyword: Optional[str] = None  # Made optional
    media: list[str]
    retweet: object
    conversation: list[object] = []


class Keyword(BaseModel):
    document_id: str = Field(alias="_id")
    keyword: str | None
    last_scan: float | None = None
