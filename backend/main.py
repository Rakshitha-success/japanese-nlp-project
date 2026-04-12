from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from preprocessing import analyze_text
from models import tfidf_predict, bert_predict
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator

app = FastAPI(title="Japanese NLP Sentiment API 🚀")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputText(BaseModel):
    text: str
    model: str = "bert"
    use_preprocessing: bool = True


@app.get("/")
def root():
    return {"message": "API is running 🚀"}


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/predict")
def predict(data: InputText):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    analysis = analyze_text(data.text)
    text = analysis["processed_text"] if data.use_preprocessing else data.text
    model_type = data.model.lower()

    if model_type == "bert":
       result = bert_predict(text)
    elif model_type == "tfidf":
       result = tfidf_predict(text)
    else:
       raise HTTPException(status_code=400, detail="Invalid model type")
    
    translation = GoogleTranslator(source='auto', target='en').translate(data.text)
    return {
    "model_used": data.model.lower(),   # 🔥 ADD THIS
    "original_text": data.text,
    "processed_text": analysis["processed_text"],
    "tokens": analysis["tokens"],
    "pos_tags": analysis["pos_tags"],
    "prediction": result["prediction"],
    "confidence": result["confidence"],
    "translation": translation
}

@app.post("/compare")
def compare(data: InputText):
    analysis = analyze_text(data.text)

    return {
    "tfidf": {
        "raw": tfidf_predict(data.text),
        "processed": tfidf_predict(analysis["processed_text"])
    },
    "bert": {
        "raw": bert_predict(data.text),
        "processed": bert_predict(analysis["processed_text"])
    }
}