from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from preprocessing import analyze_text
from models import tfidf_predict, bert_predict

app = FastAPI(title="Japanese NLP Sentiment API 🚀")


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

    if data.model.lower() == "bert":
        result = bert_predict(text)
    elif data.model.lower() == "tfidf":
        result = tfidf_predict(text)
    else:
        raise HTTPException(status_code=400, detail="Invalid model type")

    return {
        "original_text": data.text,
        "processed_text": analysis["processed_text"],
        "tokens": analysis["tokens"],
        "pos_tags": analysis["pos_tags"],
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }


@app.post("/compare")
def compare(data: InputText):
    analysis = analyze_text(data.text)

    return {
        "tfidf_raw": tfidf_predict(data.text),
        "tfidf_processed": tfidf_predict(analysis["processed_text"]),
        "bert_raw": bert_predict(data.text),
        "bert_processed": bert_predict(analysis["processed_text"])
    }