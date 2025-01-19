
from datetime import datetime
from utils.DictTools import dict_search_keys, dict_search_key
from .TwitterApi import (
    get_tweets_by_id,
    get_tweet_by_id,
    search_tweets
)
from twitter_utils.twitterDB import TwitterDB

twitter_db = TwitterDB()


class UserDetails:
    def __init__(self, user_dict: dict) -> None:
        self.name = user_dict.get('legacy', user_dict).get('name', None)
        self.username = user_dict.get(
            'legacy', user_dict).get('screen_name', None)
        # TODO
        self.profile_image_url = user_dict.get(
            'legacy', {}).get('profile_image_url_https')

    def __getitem__(self, key):
        return getattr(self, key)


class User(object):
    instances = {}

    def __new__(cls, user_id, user_details):
        if user_id in User.instances:
            return User.instances[user_id]
        inst = super(User, cls).__new__(cls)
        User.instances[user_id] = inst
        inst.id = user_id
        inst.details = UserDetails(user_details)
        return inst

    def __getitem__(self, key):
        return getattr(self, key)

    def get_dict(self) -> dict:
        user_dict = self.details.__dict__
        user_dict["id"] = self.id
        return user_dict


def is_tweet(item): return item['entryId'].startswith('tweet')
def is_conversation(item): return item['entryId'].startswith(
    "profile-conversation")


def is_follow_suggest(item): return item['entryId'].startswith("who-to-follow")


def tweet_result(
    item): return item['content']['itemContent']['tweet_results']['result']


def extract_user_details(user_dict: dict) -> User:
    user_id = user_dict['rest_id']

    name = user_dict['legacy']['name']
    return User(
        user_id=user_id,
        user_details=user_dict
    )


def is_reply(conversation_data: dict, scraped_user_id) -> bool:
    """
Determines if the scraped user is replying to another user's tweet.

Args:
    conversation_data (dict): The conversation data structure.
    scraped_user_id (str): The ID of the user being scraped.

Returns:
    bool: True if the scraped user is replying to another user's tweet, False otherwise.
"""
    try:
        first_tweet = conversation_data['content']['items'][0]['item']['itemContent']['tweet_results']['result']
        first_tweet_user_id = first_tweet['legacy']['user_id_str']
        return first_tweet_user_id != scraped_user_id
    except KeyError as e:
        print(f"Error: Missing key in data structure: {e}")
        return False


# async def create_conversation_object(conversation_data: dict) -> dict:
#     # TODO Fix full conversation
#     """
#     Extracts details from a conversation and returns a standardized tweet object.
#     """
#     try:
#         conv_items = conversation_data['content']['items']
#         # p_id = get_parent_id(item=item)
#         # if p_id is None: p_id = conv_items[0]['entryId'].split("-")[-1]
#         p_id = p_id if (p_id := get_parent_id(item=conversation_data)
#                         ) is not None else conv_items[0]['entryId'].split("-")[-1]
#         data = await get_tweet_by_id(p_id)

#         conversation_object = await create_tweet_object(conv_items[0])

#         if 'threaded_conversation_with_injections_v2' in data['data']:
#             data = data['data']['threaded_conversation_with_injections_v2']['instructions'][0]['entries']
#             try:
#                 conv_items = [data[0]] + data[1]['content']['items']
#             except:
#                 conv_items = [
#                     tweet for tweet in data if "conversation" not in tweet['entryId']]

#         conversation_object["conversation"] = [
#             tweet_obj
#             for tweet in conv_items[1:]
#             if (tweet_obj := await create_tweet_object(tweet)) != {}
#         ]
#         return conversation_object
#     except Exception as err:
#         print(conversation_data, get_parent_id(item=conversation_data))
#         print("----------------------------------")
#         print(data)
#         raise err


async def create_narrow_conversation_object(conversation_data: dict, keyword=None) -> dict:
    """
    Extracts details from a conversation and returns a standardized tweet object - not the full conversation (for user replies).
    """
    try:
        conv_items = conversation_data['content']['items']

        conversation_object = await create_tweet_object(conv_items[0], keyword=keyword)

        conversation_object["conversation"] = [
            await create_tweet_object(tweet) for tweet in conv_items[1:]]
        return conversation_object
    except Exception as err:
        print(conversation_data, get_parent_id(item=conversation_data))
        print("----------------------------------")
        raise err


async def create_tweet_object(tweet_data: dict | None, keyword=None) -> dict:
    """
    Extracts details from a tweet and returns a standardized tweet object.
    """

    if not tweet_data:
        return {}

    # Keys to ignore during key searches
    ignore_keys = ['core', 'edit_control',
                   'quick_promote_eligibility', 'views', 'note_tweet']

    # Extract retweeted or quoted tweet data
    nested_tweet_data = dict_search_keys(
        obj=tweet_data,
        keys=['retweeted_status_result', 'quoted_status_result'],
        ignore=ignore_keys
    )

    # Process retweeted or quoted tweet if present
    retweet = None
    for nested_key in nested_tweet_data:
        retweet = await create_tweet_object(
            tweet_data=nested_tweet_data[nested_key])
        break

    # Extract primary tweet details
    tweet_details = dict_search_keys(
        obj=tweet_data,
        keys=['full_text', 'created_at', 'id_str',
              'user_id_str', 'user_results', 'media', 'article'],
        ignore=ignore_keys[1:] +
        ['retweeted_status_result', 'quoted_status_result']
    )

    # If no tweet ID is found, return an empty dictionary
    if 'id_str' not in tweet_details:
        return {}

    # Extract core information
    tweet_id = tweet_details['id_str']
    created_at = convert_twitter_date_to_timestamp(tweet_details['created_at'])
    if 'retweeted_status_result' in nested_tweet_data:
        text = ''
        media_urls = []
    else:
        text = tweet_details.get('full_text', "")
        media_urls = get_media_url(tweet_details.get('media', []))

    user_details = extract_user_details(
        tweet_details['user_results']['result']).get_dict()
    # user_details["monitored"] = bool(await twitter_db.get_user(user_details['id']))
    status = 0
    if keyword:
        status = 2
    # Construct the final tweet object
    formatted_tweet = {
        'user': user_details,
        'tweet_id': tweet_id,
        'keyword': keyword,
        'status': status,
        'created_at': created_at,
        'text': text,
        'media': media_urls,
        'retweet': retweet
    }

    return formatted_tweet


def get_media_url(media: dict) -> list:
    try:
        return [m['video_info']['variants'][-1]['url'] if m['type'] == "video" else m['media_url_https'] for m in media]
    except TypeError as e:
        raise e


def get_parent_id(item: dict): return dict_search_keys(
    obj=item,
    keys=['conversation_id_str', 'id_str'],
    ignore=['clientEventInfo', 'core', 'edit_control', 'quick_promote_eligibility',
            'views', 'retweeted_status_result', 'quoted_status_result']
).get('conversation_id_str')


def get_tweet_entries(json_tweets):
    try:
        return json_tweets['data']['user']['result']['timeline_v2']['timeline']['instructions'][-1]['entries']
    except KeyError as err:
        return dict_search_key(json_tweets, 'entries')


def get_search_entries(json_tweets):
    try:
        return json_tweets['data']['search_by_raw_query']['search_timeline']['timeline']['instructions'][0]['entries']
    except Exception as e:
        return []


def get_bottom_cursor(entries) -> str:
    return entries[-1]['content']['value']


def get_bottom_cursor_new(search_result):
    return search_result['data']['search_by_raw_query']['search_timeline']['timeline']['instructions'][-1]['entry']['content']['value']


def convert_twitter_date_to_timestamp(date: str) -> float:
    twitter_date_format = r"%a %b %d %H:%M:%S %z %Y"
    return datetime.strptime(date, twitter_date_format).timestamp()


def tweet_date_verify(tweet_entity, date_limit: int):
    created_date_timestamp = None
    if is_tweet(tweet_entity):
        created_date_str = tweet_result(tweet_entity)["legacy"]["created_at"]
        created_date_timestamp = convert_twitter_date_to_timestamp(
            created_date_str)
    elif is_conversation(tweet_entity):
        created_date_str = tweet_entity["content"]['items'][-1]['item'][
            'itemContent']['tweet_results']['result']["legacy"]["created_at"]
        created_date_timestamp = convert_twitter_date_to_timestamp(
            created_date_str)

    return created_date_timestamp and created_date_timestamp >= date_limit


# Add until_date var and get all tweets until the specified date
async def get_user_tweets_by_date(user_id: str, date_limit=None) -> list:
    result_tweet_entities = []
    cursor_id = None
    while True:
        search_results = await get_tweets_by_id(user_id=user_id, cursor=cursor_id)
        tweet_entities_batch = get_tweet_entries(search_results)
        if not tweet_entities_batch:
            break

        for tweet_entity in tweet_entities_batch:
            if is_conversation(tweet_entity) or is_tweet(tweet_entity):
                if tweet_date_verify(tweet_entity, date_limit):
                    result_tweet_entities.append(tweet_entity)
                else:
                    # If a tweet is older than the date limit, exit the loop
                    return result_tweet_entities
            else:
                continue

        # Update the cursor for the next batch
        try:
            new_cursor_id = get_bottom_cursor(tweet_entities_batch)
        except:
            new_cursor_id = get_bottom_cursor_new(search_results)

        if new_cursor_id is None or new_cursor_id == cursor_id:
            break
        cursor_id = new_cursor_id

    return result_tweet_entities


def search_tweets_by_keyword(keyword: str, date_limit=None):
    result_tweet_entities = []
    cursor_id = None
    until_date = datetime.today().strftime('%Y-%m-%d')
    since_date = datetime.fromtimestamp(date_limit).strftime('%Y-%m-%d')
    search_query = f"\"{keyword}\" until:{until_date} since:{since_date}"
    while True:
        search_results = search_tweets(
            search_query=search_query, cursor=cursor_id)

        tweet_entities_batch = get_search_entries(search_results)
        if not len(tweet_entities_batch):
            break

        result_tweet_entities += tweet_entities_batch
        try:
            new_cursor_id = get_bottom_cursor(tweet_entities_batch)
        except:
            new_cursor_id = get_bottom_cursor_new(search_results)

        if new_cursor_id is None or new_cursor_id == cursor_id:
            break
        cursor_id = new_cursor_id
    return result_tweet_entities
