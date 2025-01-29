from twitter_utils.logging_config import setup_logging
import logging
from twitterTask import insert_keyword_tweets, insert_user_tweets
from twitter_utils.twitterDB import TwitterDB
import asyncio
import argparse
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)

setup_logging(log_file='TwitterScheduler.log')

twitter_db = TwitterDB()


async def run_tasks():
    users = await twitter_db.get_users()
    keywords = await twitter_db.get_keywords()

    for user in users:
        insert_user_tweets.delay(user['_id'])

    for keyword in keywords:
        insert_keyword_tweets.delay(keyword['_id'])


async def start_scheduler(interval):
    scheduler = AsyncIOScheduler()
    # scheduler interval time
    scheduler.add_job(run_tasks, 'interval', minutes=interval)
    scheduler.start()
    await asyncio.Event().wait()


def main():
    parser = argparse.ArgumentParser(
        description="Run a scheduler that executes tasks at intervals.")

    # Add the interval argument (in minutes)
    parser.add_argument(
        "--interval",
        type=int,
        default=1440,  # Default interval is (24 hours)
        help="Interval in minutes for scheduling tasks (default is 1440 minutes)."
    )

    args = parser.parse_args()

    asyncio.run(start_scheduler(interval=args.interval))


if __name__ == "__main__":
    main()
