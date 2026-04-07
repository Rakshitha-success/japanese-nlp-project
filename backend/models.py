import joblib
import torch
from transformers import pipeline

# ---------------------------
# Load TF-IDF
# ---------------------------
try:
    tfidf_vectorizer = joblib.load("saved_models/tfidf_vectorizer.pkl")
    tfidf_model = joblib.load("saved_models/tfidf_model.pkl")
except:
    tfidf_vectorizer = None
    tfidf_model = None


# ---------------------------
# Load Pretrained Sentiment Model (NO TRAINING NEEDED)
# ---------------------------
print("🔹 Loading pretrained sentiment model...")

sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment"
)


# ---------------------------
# TF-IDF Prediction
# ---------------------------
def tfidf_predict(text: str):
    if not text or tfidf_vectorizer is None or tfidf_model is None:
        return {"prediction": "error", "confidence": 0.0}

    X = tfidf_vectorizer.transform([text])
    pred = tfidf_model.predict(X)[0]
    prob = max(tfidf_model.predict_proba(X)[0])

    return {
        "prediction": str(pred),
        "confidence": float(prob)
    }


# ---------------------------
# BERT (Pretrained Pipeline)
# ---------------------------
def bert_predict(text: str):
    if not text:
        return {"prediction": "error", "confidence": 0.0}

    result = sentiment_pipeline(text)[0]

    # Convert stars to sentiment
    label = result["label"]
    score = result["score"]

    if "1" in label or "2" in label:
        sentiment = "negative"
    elif "3" in label:
        sentiment = "neutral"
    else:
        sentiment = "positive"

    return {
        "prediction": sentiment,
        "confidence": float(score)
    }