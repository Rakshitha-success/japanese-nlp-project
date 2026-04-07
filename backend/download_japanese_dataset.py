from datasets import load_dataset
import pandas as pd

OUTPUT_FILE = "data/data.csv"


def convert_rating(rating):
    if rating <= 2:
        return "negative"
    elif rating == 3:
        return "neutral"
    else:
        return "positive"


print("🔹 Downloading Japanese dataset...")

# NEW SAFE METHOD
dataset = load_dataset("SetFit/amazon_reviews_multi_ja", split="train")

print("🔹 Processing data...")

texts = []
labels = []

for item in dataset:
    text = item["text"]
    rating = item["label"]

    if text:
        texts.append(text.strip())

        # label is already 0–4 → convert
        labels.append(convert_rating(rating + 1))

print(f"✅ Total samples: {len(texts)}")

df = pd.DataFrame({
    "text": texts,
    "label": labels
})

df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

print("🎉 Dataset saved to data/data.csv")