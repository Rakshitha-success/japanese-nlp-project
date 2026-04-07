import pandas as pd
import joblib
import os

from preprocessing import analyze_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


DATA_PATH = "data/data.csv"
MODEL_DIR = "saved_models"


# 🔹 Load dataset safely
def load_data(path=DATA_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}")

    try:
        df = pd.read_csv(path, encoding="utf-8")
    except:
        df = pd.read_csv(path, encoding="utf-8-sig")

    # Clean column names
    df.columns = df.columns.str.strip().str.lower()

    # Debug print
    print("📊 Columns detected:", df.columns.tolist())

    if "text" not in df.columns or "label" not in df.columns:
        raise ValueError("❌ CSV must contain 'text' and 'label' columns")

    # Drop missing values
    df = df.dropna(subset=["text", "label"])

    if len(df) == 0:
        raise ValueError("❌ Dataset is empty after cleaning")

    return df


# 🔹 Preprocess text
def preprocess_data(df):
    print("🔹 Preprocessing text...")

    df["processed"] = df["text"].astype(str).apply(
        lambda x: analyze_text(x)["processed_text"]
    )

    return df


# 🔹 Train TF-IDF model
def train_model(df):
    print("🔹 Training TF-IDF model...")

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2)  # better performance
    )

    X = vectorizer.fit_transform(df["processed"])
    y = df["label"]

    model = LogisticRegression(
        max_iter=300,
        solver="lbfgs"
    )

    model.fit(X, y)

    return vectorizer, model


# 🔹 Save model
def save_model(vectorizer, model):
    print("🔹 Saving models...")

    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(model, os.path.join(MODEL_DIR, "tfidf_model.pkl"))


# 🔹 Main execution
if __name__ == "__main__":
    print("🚀 Starting training pipeline...\n")

    try:
        df = load_data()

        print(f"✅ Loaded {len(df)} samples")

        df = preprocess_data(df)

        vectorizer, model = train_model(df)

        save_model(vectorizer, model)

        print("\n🎉 Training completed successfully!")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")