import asyncio
import logging
from celery import Celery
from twitter_utils.TwitterApi import get_user_id, get_user_details
from twitter_utils.TwitterManager import (
    tweet_result,
    get_user_tweets_by_date,
    is_tweet,
    is_reply,
    is_conversation,
    create_tweet_object,
    create_narrow_conversation_object,
    extract_user_details,
    search_tweets_by_keyword
)
from twitter_utils.twitterDB import TwitterDB
import time

from twitter_utils.logging_config import setup_logging

app = Celery('twitterTask', broker='pyamqp://', backend='rpc://')

# Create and get the event loop at the module level
loop = asyncio.get_event_loop()

setup_logging()
logger = logging.getLogger(__name__)


twitter_db = TwitterDB()

# build tweet object and insert to MongoDB


async def handle_tweet_entry(tweet_entry: dict, keyword=None) -> None:
    tweets = await create_tweet_object(tweet_data=tweet_result(tweet_entry), keyword=keyword)
    await twitter_db.insert_tweet(tweets)

# build conversation tweet object and insert to MongoDB


async def handle_conversation_entry(conversation_entry: dict, scraped_user_id=None, keyword=None) -> None:
    """
    Processes a conversation entry by determining its type and saving it to the database.

    Args:
        conversation_entry (dict): The data structure of the conversation entry.
        scraped_user_id (str, optional): The user ID being scraped.
    """

    conversation = await create_narrow_conversation_object(conversation_entry, keyword=keyword)
    await twitter_db.insert_tweet(conversation)


async def update_user_details(user: dict) -> None:
    user_result = get_user_details(user['username'])
    user_result = user_result["data"]["user"]["result"]
    user_result = extract_user_details(user_result).get_dict()
    await twitter_db.update_user(user['_id'], **user_result)
    return user_result


async def insert_user_tweets_async(_id: str) -> None:
    user_obj = await twitter_db.get_user_obj(_id)
    user_id = user_obj['id']
    date_limit = user_obj['last_scan']
    if user_id is None:
        logger.info(
            f'User {user_obj["username"]} is new. Fetching its details.')
        user_results = await update_user_details(user_obj)
        user_id = user_results['id']

    new_scan_ts = time.time()
    logger.info(
        f"Starting scan on user {user_obj['username']} from {date_limit} till date {new_scan_ts}")
    json_tweets = await get_user_tweets_by_date(user_id=user_id, date_limit=date_limit)
    for tweet_entry in json_tweets:
        if is_tweet(tweet_entry):
            await handle_tweet_entry(tweet_entry)
        elif is_conversation(tweet_entry):
            await handle_conversation_entry(tweet_entry, user_id)
    await twitter_db.update_user(_id, last_scan=new_scan_ts)
    logger.info(
        f"Scan completed for user {user_obj['username']} | {len(json_tweets)} tweets were found.")


async def insert_keyword_tweets_async(_id: str):
    new_scan_ts = time.time()
    keyword_obj = await twitter_db.get_keyword_obj(_id)

    # Corrected log statement with proper quote usage
    logger.info(
        f"Starting scan on keyword {keyword_obj['keyword']} from "
        f"{keyword_obj['last_scan']} till date {new_scan_ts}"
    )

    json_tweets = search_tweets_by_keyword(
        keyword=keyword_obj['keyword'], date_limit=keyword_obj['last_scan']
    )
    tweets_sum = 0
    for tweet_entry in json_tweets:
        if is_tweet(tweet_entry):
            tweets_sum += 1
            await handle_tweet_entry(tweet_entry, keyword=keyword_obj['keyword'])
        elif is_conversation(tweet_entry):
            tweets_sum += 1
            await handle_conversation_entry(tweet_entry, keyword=keyword_obj['keyword'])

    await twitter_db.update_keyword(_id=_id, last_scan=new_scan_ts)
    logger.info(
        f"Scan completed for keyword {keyword_obj['keyword']} | "
        f"{tweets_sum} tweets were found."
    )

# celery tasks


@app.task
def insert_keyword_tweets(_id: str):
    loop.run_until_complete(insert_keyword_tweets_async(_id))


@app.task
def insert_user_tweets(_id: str):
    loop.run_until_complete(insert_user_tweets_async(_id))
