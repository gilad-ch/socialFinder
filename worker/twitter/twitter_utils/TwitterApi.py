import logging
import os
import requests
import json
import zstandard
from collections import deque
from os import path
import httpx
import asyncio
from utils.FilesManager import File
from twitter_utils.TwitterUtils import RequestManager, APIHelper

logger = logging.getLogger(__name__)

current_path = os.path.dirname(__file__)
api_config = File(path.join(current_path, 'ApiConfig.json'))

Url = api_config.content['URL']
Params = api_config.content['PARAMS']


@RequestManager
async def get_tweets_by_id(user_id, headers=None, cursor=None):
    Params["VARIABLES"]['userId'] = user_id
    if cursor:
        Params["VARIABLES"]['cursor'] = cursor
    else:
        try:
            del Params["VARIABLES"]['cursor']
        except KeyError:
            ...

    headers['path'] = APIHelper.construct_url(
        url=Url["USER_TWEETS_AND_REPLIES_API"],
        __VARIABLES__=Params["VARIABLES"],
        __FEATURES__=Params["FEATURES"],
        __FIELDS_TOGGLES__=Params["FIELDS_TOGGLES"]
    )
    async with httpx.AsyncClient() as client:
        try:
            logger.debug(f"Sending request to fetch tweets by ID: {user_id}")
            response = await client.get(Url["TWITTER_DOMAIN"] + headers['path'], headers=headers)
            response_json = json.loads(response.content)
            logger.debug("Successfully fetched tweets.")
            return response_json
        except httpx.HTTPStatusError as http_err:
            logger.error(f"HTTP error occurred: {http_err}")
            raise
        except json.JSONDecodeError as json_err:
            logger.error(f"JSON decoding error: {json_err}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise


@RequestManager
async def get_tweets_by_username(username, headers=None):
    logger.debug(f"Fetching tweets for username: {username}")
    user_id = get_user_id(username)
    return await get_tweets_by_id(user_id)


@RequestManager
def get_user_details(username, headers=None):
    Params["USER_VARIABLES"]["screen_name"] = username
    headers['path'] = APIHelper.construct_url(
        url=Url["USER_DETAILS_API"],
        __VARIABLES__=Params["USER_VARIABLES"],
        __FEATURES__=Params["USER_FEATURES"],
        __FIELDS_TOGGLES__=Params["FIELDS_TOGGLES"]
    )
    try:
        response = requests.get(
            Url["TWITTER_DOMAIN"] + headers['path'], headers=headers)
        response.raise_for_status()
        return json.loads(response.content.decode('utf-8'))
    except requests.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        raise
    except json.JSONDecodeError as json_err:
        logger.error(f"JSON decoding error: {json_err}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise


@RequestManager
def get_user_id(username, headers=None):
    logger.debug(f"Fetching user ID for username: {username}")
    try:
        response = requests.get(Url["TWITTER_DOMAIN"] + APIHelper.construct_url(
            Url["USER_ID_API"], __USERNAME__=username), headers=headers)
        response.raise_for_status()
        data = json.loads(response.content.decode('utf-8'))
        logger.debug(
            f"Successfully fetched user ID for: {username}")
        return data['data']['user_result_by_screen_name']['result']['rest_id']
    except requests.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        raise
    except json.JSONDecodeError as json_err:
        logger.error(f"JSON decoding error: {json_err}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise


@RequestManager
async def get_tweet_by_id(tweet_id: str, headers=None):
    logger.debug(f'Fetching tweet {tweet_id}')
    Params["TWEET_VARIABLES"]['focalTweetId'] = tweet_id
    headers['path'] = APIHelper.construct_url(
        url=Url["TWEET_API"],
        __VARIABLES__=Params["TWEET_VARIABLES"],
        __FEATURES__=Params["TWEET_FEATURES"],
        __FIELDS_TOGGLES__=Params["TWEET_FIELDS_TOGGLES"]
    )
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(Url["TWITTER_DOMAIN"] + headers['path'], headers=headers)
            response_json = json.loads(response.content)
            logger.debug(f'Successfully fetched tweet: {tweet_id}')
            return response_json
        except httpx.HTTPStatusError as http_err:
            logger.error(f"HTTP error occurred: {http_err}")
            raise
        except json.JSONDecodeError as json_err:
            logger.error(f"JSON decoding error: {json_err}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise


@RequestManager
def search_tweets(search_query: str, headers=None, cursor=None):
    if cursor:
        Params["SEARCH_VARIABLES"]['cursor'] = cursor
    else:
        Params["SEARCH_VARIABLES"].pop('cursor', None)

    Params["SEARCH_VARIABLES"]["rawQuery"] = search_query
    headers['path'] = APIHelper.construct_url(
        url=Url["SEARCH_TWEETS_API"],
        __VARIABLES__=Params["SEARCH_VARIABLES"],
        __FEATURES__=Params["SEARCH_FEATURES"]
    )
    try:
        response = requests.get(
            Url["TWITTER_DOMAIN"] + headers['path'], headers=headers)
        response.raise_for_status()
        result = json.loads(response.content.decode('utf-8'))
        return result
    except requests.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        raise
    except json.JSONDecodeError as json_err:
        logger.error(f"JSON decoding error: {json_err}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
