from typing import Optional
from fastapi import HTTPException
from fastapi import FastAPI, HTTPException
from routes import twitter
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator

translator = GoogleTranslator(source='auto', target='iw')
app = FastAPI()
origins = [
    "http://localhost:5173",  # React app's URL during development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get('/api/translate')
async def translate_text(text: str, target_lang: Optional[str] = 'iw'):
    # Validate text length
    MAX_TEXT_LENGTH = 500
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Text is too long. Maximum allowed length is {
                MAX_TEXT_LENGTH} characters."
        )
    if not text:
        raise HTTPException(
            status_code=400, detail="Text to translate is required")

    try:
        # Example of specifying a target language for the translation (optional parameter)
        translated_text = translator.translate(text, target_lang=target_lang)

        if not translated_text:
            raise ValueError("Translation failed to return valid data.")

        return {"original_text": text, "translated_text": translated_text}

    except ValueError as ve:
        # Handle any specific translation errors like invalid data from the translation service
        raise HTTPException(
            status_code=422, detail=f"Translation error: {str(ve)}")
    except Exception as e:
        # Catch any other exceptions and provide a more generic error message
        raise HTTPException(
            status_code=500, detail=f"An internal server error occurred: {str(e)}")

app.include_router(twitter.router, prefix="/api")
