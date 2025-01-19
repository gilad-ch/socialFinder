from twitter_utils.logging_config import setup_logging
import logging
from twitterTask import insert_keyword_tweets, insert_user_tweets
from twitter_utils.twitterDB import TwitterDB
import asyncio
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)

setup_logging()

twitter_db = TwitterDB()


async def run_tasks():
    users = await twitter_db.get_users()
    keywords = await twitter_db.get_keywords()

    for user in users:
        insert_user_tweets.delay(user['_id'])

    for keyword in keywords:
        insert_keyword_tweets.delay(keyword['_id'])


async def start_scheduler():
    scheduler = AsyncIOScheduler()
    # scheduler interval time
    scheduler.add_job(run_tasks, 'interval', hours=24)
    scheduler.start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(start_scheduler())
