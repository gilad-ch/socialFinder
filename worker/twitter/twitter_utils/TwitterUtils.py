import json
import os
import time
from os import path
from collections import deque
from urllib import parse
import logging

logger = logging.getLogger(__name__)

# Ratelimit handler


class RequestManager:
    counter = 0
    current_header = None
    headers_list = list()
    header_index = 0
    current_path = os.path.dirname(__file__)
    headers_path = path.join(current_path, 'Headers.json')

    with open(headers_path, 'r') as f:
        hdrs = json.load(f)
        for hdr in hdrs:
            headers_list.append(hdr)
        current_header = headers_list[header_index]

    headers_time = [None for _ in range(len(headers_list))]

    def get_header_time():
        return RequestManager.headers_time[RequestManager.header_index]

    def rotate_header():
        RequestManager.header_index = (
            RequestManager.header_index + 1) % len(RequestManager.headers_list)
        RequestManager.current_header = RequestManager.headers_list[RequestManager.header_index]
        RequestManager.counter = 0
        logger.info(
            f"Swapping to header index: {RequestManager.header_index}")

        if RequestManager.get_header_time() and ((time.time() - RequestManager.get_header_time()) < 16 * 60):
            sleep_time = 16 - \
                ((time.time() - RequestManager.get_header_time()) / 60)
            logger.info(
                f"Rate limit might be hit soon. Sleeping for {sleep_time:.2f} minutes.")
            time.sleep(sleep_time * 60)

        RequestManager.headers_time[RequestManager.header_index] = time.time(
        )

    def __init__(self, func):
        RequestManager.headers_time[0] = RequestManager.headers_time[0] or time.time(
        )
        self.func = func

    def __call__(self, *args, **kwargs):
        RequestManager.counter += 1
        logger.info(f"Request count: {RequestManager.counter}")

        # Rotate headers after every 10 requests
        if len(RequestManager.headers_list) and RequestManager.counter % 20 == 0:
            RequestManager.rotate_header()

        try:
            response = self.func(
                *args, headers=RequestManager.current_header, **kwargs)
            if hasattr(response, 'errors'):
                logger.warning(
                    f"Received response with Error {response['errors']['code']}:{response['errors']['message']}.")
            return response
        except Exception as e:
            if hasattr(e, 'response'):
                if e.response.status_code == 429:
                    logger.warning(
                        "Received 429 Too Many Requests.")
                    RequestManager.rotate_header()
                    return self(*args, **kwargs)
                elif e.response.status_code == 401:
                    logger.error(
                        "Received 401 Client authorized. Header need to be updeated.")
                    RequestManager.rotate_header()
                    return self(*args, **kwargs)
            else:
                raise


class APIHelper:
    def construct_url(url: str, **params) -> str:
        def isdict(dictionary): return isinstance(dictionary, dict)
        url = url.format(**{key: parse.quote(json.dumps(value))
                         if isdict(value) else value for key, value in params.items()})
        logger.debug(f"Constructed URL: {url}")
        return url
