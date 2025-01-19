def search_multiple_keys_rec(dictionary, keys, keys_dict, ignore_keys):
    for key, value in dictionary.items():
        if len(keys_dict) == len(keys):
            return keys_dict

        if key in keys:
            keys_dict[key] = value

        elif isinstance(value, dict) and key not in ignore_keys:
            search_multiple_keys_rec(value, keys, keys_dict, ignore_keys)

    return keys_dict


def search_multiple_keys(dictionary, keys, ignore_keys=None):
    if ignore_keys is None:
        ignore_keys = []

    keys_dict = {}
    return search_multiple_keys_rec(dictionary, keys, keys_dict, ignore_keys)


def search_one_key_rec(dictionary, search_key):
    for key, value in dictionary.items():
        if search_key == key:
            return value
        elif isinstance(value, dict):
            result = search_one_key_rec(value, search_key)
            if result is not None:
                return result

    return None


def search_one_key(dictionary, search_key, ignore_keys=None):
    if ignore_keys is None:
        ignore_keys = []

    if search_key in dictionary:
        return dictionary[search_key]

    for key, value in dictionary.items():
        if isinstance(value, dict) and key not in ignore_keys:
            result = search_one_key_rec(value, search_key)
            if result is not None:
                return result

    return None
