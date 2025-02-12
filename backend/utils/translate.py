import re
import requests
import urllib.parse

class googleTranslate:
    URL = "https://www.google.com/async/translate?vet=12ahUKEwjq9Jm8o7uLAxW76wIHHew7N-gQqDh6BAgHEC0..i&ei=XRSrZ6rSObvXi-gP7PfcwQ4&opi=89978449&rlz=1C1GCEB_enIL1082IL1082&yv=3&_fmt=pc&cs=0" 
    HEADERS = {
        "Accept": "*/*",
        "Accept-Encoding": "UTF-8",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Length": "1767",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Origin": "https://www.google.com",
        "Referer": "https://www.google.com/",
        "Sec-CH-UA": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "Sec-CH-UA-Arch": "x86",
        "Sec-CH-UA-Bitness": "64",
        "Sec-CH-UA-Form-Factors": "Desktop",
        "Sec-CH-UA-Full-Version": '"132.0.6834.160"',
        "Sec-CH-UA-Full-Version-List": '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.160", "Google Chrome";v="132.0.6834.160"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Model": '""',
        "Sec-CH-UA-Platform": "Windows",
        "Sec-CH-UA-Platform-Version": '"10.0.0"',
        "Sec-CH-UA-WOW64": "?0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    }

    TRANSLATE_LOCATION = r'<span id="tw-answ-target-text">(.*?)</span>'

    def __init__(self, source_lang="auto", target_lang="iw"):
        self.source_lang = source_lang
        self.target_lang = target_lang

    def translate(self, text):
        encoded_text = urllib.parse.quote(text)
        body = f"async=translate,sl:{self.source_lang},tl:{self.target_lang},st:{encoded_text},id: 1739265142441,qc: true,ac: false,_id:tw-async-translate,_pms:s,_fmt:pc,_basejs:%2Fxjs%2F_%2Fjs%2Fk%3Dxjs.s.iw.vyFie24kWPQ.2018.O%2Fam%3DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAARQAAIgAAAAAACABAABAAAAAAAAACQAAAAAAAAIEAAEECQAAIAAAAAAAMAEAAAgYAEIGAAAAAAAAABAAAAAAIEIgP3-wwEAAAAAAAAAAAAAApAAAAAAAADgAgAgAB_CHiAAAAAAQAAAAABAAAAAAAAgAAAAQAEAAAAEAAAAAAgAAAAAAAABAAAAIAAA9AEAAAAAAAAAAAAAQAAAAAAAAAagAAAC-AEAAAAAAAA4AAAAAAECAADgGBiAAAAAAAAAAOwB4PGAcEhhAQAAAAAAAAAAAAAAAAQgQTAH0l8QgAAAAAAAAAAAAAAAAAAAAFIETVzeAIA%2Fdg%3D0%2Fbr%3D1%2Frs%3DACT90oF9eQ1i_ddjZ2V5-DilYVFZTL1vHQ,_basecss:%2Fxjs%2F_%2Fss%2Fk%3Dxjs.s.Ahq3XjJr3Gk.R.B1.O%2Fam%3DAOIQIAQAAAACAABACAAVAAQAAAAAAAAAAAAAAAAAAAAAAAAASAAAAIAAAACAAAAAgAAAAAARAAAAABIAABCcEAABdgAAAADwAQTiVAAEAAAAAAAEACQAAAAAQAAgAIAEEAAAQAAAAACCAAAACABwAAAgAAAIAAAAhIEBABgAAAAABAARggEABIABAHAAAiABAAACHAD5AUABAAAgAABAAAAABeAhGAZAUAEwgCOAAAAAAAAAAAAAAAIAhAAAYABQAAAECADQA0AAPgAASRABAEIBAASgEAAQAAAAAgAAAAAAAgQCAABACADgGBiAAAAAAAAAACABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAEA%2Fbr%3D1%2Frs%3DACT90oEvolPIJmSawUj8pNUGXFXKH_v6yQ,_basecomb:%2Fxjs%2F_%2Fjs%2Fk%3Dxjs.s.iw.vyFie24kWPQ.2018.O%2Fck%3Dxjs.s.Ahq3XjJr3Gk.R.B1.O%2Fam%3DAOIQIAQAAAACAABACAAVAAQAAAAAAAAAAAAAAAAAAAAAAAAASAAAAIAAAACAAAAAgAAAAARRAAIgABIAABCcFAABdgAAAADwASTiVAAEAAAIEAAEECQAAIAAQAAgAMAEEAAgYAEIGACCAAAACABwAAAgAIEIgP3-x4EBABgAAAAABAARgpEABIABAHDgAiAhAB_CHiD5AUABQAAgAABAAAAABeAhGAZAUAEwgCOEAAAAAAgAAAAAAAIBhAAAYABQ9AEECADQA0AAPgAASRABAEIBAAagEAAS-AEAAgAAAAA4AgQCAAFCCADgGBiAAAAAAAAAAOwB4PGAcEhhAQAAAAAAAAAAAAAAAAQgQTAH0l8QgAAAAAAAAAAAAAAAAAAAAFIETVzeAIA%2Fd%3D1%2Fed%3D1%2Fdg%3D0%2Fbr%3D1%2Fujg%3D1%2Frs%3DACT90oH5vwO7McFrS_5oxHEXtSE9zr8DYQ"
        try:
            response = requests.post(googleTranslate.URL, headers=googleTranslate.HEADERS, data=body)
            if response.status_code == 200:
                match = re.search(googleTranslate.TRANSLATE_LOCATION, response.text)
                if match:
                    translated_text = match.group(1)
                    return{"translated_text": translated_text}
                else:
                    raise requests.RequestException(f"Erorr: couldn't find translation result in the response")
            else:
                 raise requests.RequestException(f"Error: {response.status_code}")
        except Exception as e:
            raise requests.RequestException(f"An error occurred when requesting a translation: {str(e)}")
