from .dictsearch.pydictsearch import search_multiple_keys, search_one_key
# from dictsearch import search_multiple_keys, search_one_key
def dict_search_keys(obj, keys: list, ignore: list = []) -> dict:
    return search_multiple_keys(obj, keys, ignore)


def dict_search_key(obj, keys: str, ignore: list = []):
    return search_one_key(obj, keys, ignore)
