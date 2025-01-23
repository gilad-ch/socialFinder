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
async def translate_text(text: str):
    try:
        translated_text = translator.translate(text)
        return {"original_text": text, "translated_text": translated_text}
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Couldn't translate text: {str(e)}"
        )
app.include_router(twitter.router, prefix="/api")
