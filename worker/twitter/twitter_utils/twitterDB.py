import logging
from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional

logger = logging.getLogger(__name__)


class TwitterDB:
    def __init__(self):
        try:
            logger.debug("connecting to MongoDB server")
            client = AsyncIOMotorClient('mongodb://localhost:27017')
            db = client.twitter
            self.tweets = db.tweets
            self.users = db.users
            self.keywords = db.keywords
            logger.debug("connected to MongoDB server")
        except Exception as e:
            logger.error("Failed to connect to MongoDB server: %s", e)

    def id_to_str(self, item):
        if item:
            item["_id"] = str(item["_id"])
        return item
# ------------ tweets ------------

    async def insert_tweet(self, tweet_dict: dict):
        logger.debug(f"Inserting tweet: {tweet_dict['tweet_id']}")
        try:
            await self.tweets.insert_one(tweet_dict)
            logger.debug(
                f"Tweet {tweet_dict['tweet_id']} inserted successfully.")
        except Exception as e:
            logger.error(
                f"Failed to insert tweet {tweet_dict['tweet_id']}: {e}")

    async def get_tweets(
        self,
        status: int = 0,
        date_limit: float = None,
        user_id: str = None,
        keyword: str = None,
        search: str = None
    ):
        if date_limit is None:
            date_limit = time.time()

        query = {"status": status, "created_at": {"$lt": date_limit}}

        if user_id:
            query["user.id"] = user_id

        if keyword:
            query["keyword"] = keyword

        if search:
            # Case-insensitive search
            query["text"] = {"$regex": search, "$options": "i"}

        frame_size = 10
        tweets_cursor = self.tweets.find(query).sort(
            "created_at", -1).limit(frame_size)
        tweets = await tweets_cursor.to_list(length=frame_size)

        return [self.id_to_str(tweet) for tweet in tweets]

    async def delete_tweet(self, _id):
        await self.tweets.delete_one({"_id": ObjectId(_id)})

    async def update_tweet_status(self, tweet_id, status):
        filter_criteria = {"tweet_id": tweet_id}
        update_data = {"$set": {"status": status}}
        result = await self.tweets.update_one(filter_criteria, update_data)
        return result
# ------------ users ------------

    # TODO change to _id

    async def remove_user(self, username_or_userid: str):
        logger.debug(f"Removing user: {username_or_userid}")
        try:
            user = await self.users.find_one({"$or": [{"username": username_or_userid}, {"userid": username_or_userid}]})
            if user:
                await self.users.delete_one({"_id": user["_id"]})
                logger.debug(
                    f"User {username_or_userid} removed successfully.")
            else:
                logger.warning(f"User {username_or_userid} not found.")
        except Exception as e:
            logger.error(f"Failed to remove user {username_or_userid}: {e}")

    async def insert_user(self, user_dict: dict):
        return await self.users.update_one(
            filter={"username": user_dict["username"]},
            update={"$setOnInsert": user_dict},
            upsert=True
        )

    async def get_users(self):
        logger.debug("Fetching all users.")
        try:
            users_cursor = self.users.find({})
            users = await users_cursor.to_list(length=None)
            logger.debug(f"Fetched {len(users)} users.")
            return [self.id_to_str(user) for user in users]
        except Exception as e:
            logger.error(f"Failed to fetch users: {e}")
            return []

    async def update_user(self, _id, **user_details):
        logger.debug(
            f"Updating user: {_id} with details {user_details}")
        filter_query = {"_id": ObjectId(_id)}
        try:
            await self.users.update_one(filter_query, {"$set": user_details})
            logger.debug(f"User {_id} updated successfully.")
        except Exception as e:
            logger.error(f"Failed to update user {_id}: {e}")

    async def get_user(self, username_or_id: str) -> Optional[dict]:
        logger.debug(f"Fetching user: {username_or_id}")
        try:
            user = await self.users.find_one({"$or": [{"username": username_or_id}, {"id": username_or_id}]})
            if user:
                logger.debug(f"User {username_or_id} fetched successfully.")
                return self.id_to_str(user)
            else:
                logger.warning(f"User {username_or_id} not found.")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch user {username_or_id}: {e}")
            return None

    async def get_user_obj(self, _id):
        logger.debug(f"Fetching user: {_id}")
        try:
            # Ensure _id is passed as an ObjectId instance
            user_obj = await self.users.find_one({"_id": ObjectId(_id)})
            if user_obj:
                logger.debug(f"user {_id} fetched successfully.")
                return self.id_to_str(user_obj)
            else:
                logger.warning(f"User {_id} not found.")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch User {_id}: {e}")
            return None
# ------------ keywords ------------

    async def get_keywords(self):
        logger.debug("Fetching all eywords.")
        try:
            keywords_cursor = self.keywords.find({})
            keywords = await keywords_cursor.to_list(length=None)
            logger.debug(f"Fetched {len(keywords)} keywords.")
            return [self.id_to_str(keyword) for keyword in keywords]
        except Exception as e:
            logger.error(f"Failed to fetch keywords: {e}")
            return []

    async def get_keyword_obj(self, _id):
        logger.debug(f"Fetching keyword: {_id}")
        try:
            # Ensure _id is passed as an ObjectId instance
            keyword_obj = await self.keywords.find_one({"_id": ObjectId(_id)})
            if keyword_obj:
                logger.debug(f"Keyword {_id} fetched successfully.")
                return self.id_to_str(keyword_obj)
            else:
                logger.warning(f"Keyword {_id} not found.")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch keyword {_id}: {e}")
            return None

    async def update_keyword(self, _id, **keyword_details):
        logger.debug(
            f"Updating keyword: {_id} with details {keyword_details}")
        filter_query = {"_id": ObjectId(_id)}
        try:
            await self.keywords.update_one(filter_query, {"$set": keyword_details})
            logger.debug(f"Keyword {_id} updated successfully.")
        except Exception as e:
            logger.error(f"Failed to update keyword {_id}: {e}")

    async def delete_keyword(self, _id: str):
        await self.keywords.delete_one({"_id": ObjectId(_id)})

    async def insert_keyword(self, keyword_dict: dict):
        return await self.keywords.update_one(
            filter={"keyword": keyword_dict["keyword"]},
            update={"$setOnInsert": keyword_dict},
            upsert=True
        )


class User(BaseModel):
    name: str
    username: str
    id: str
    profile_image_url: str
    last_scan: float | None


class Tweet(BaseModel):
    user: User
    tweet_id: str
    created_at: str
    text: str
    media: list[str]
    retweet: object


class Keyword(BaseModel):
    document_id: str = Field(alias="_id")
    keyword: str | None
    last_scan: float | None = None
