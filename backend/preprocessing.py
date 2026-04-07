import unicodedata
from sudachipy import dictionary, tokenizer

# Initialize once (faster)
_tokenizer = dictionary.Dictionary().create()
_mode = tokenizer.Tokenizer.SplitMode.C

STOPWORDS = {'する', 'ある', 'いる'}

VALID_POS = {'名詞', '動詞', '形容詞'}


def normalize_text(text: str) -> str:
    return unicodedata.normalize('NFKC', text.strip())


def analyze_text(text: str) -> dict:
    if not text:
        return {
            "original": "",
            "tokens": [],
            "pos_tags": [],
            "lemmas": [],
            "processed_text": ""
        }

    text = normalize_text(text)
    tokens = _tokenizer.tokenize(text, _mode)

    token_list, pos_list, lemma_list, filtered = [], [], [], []

    for t in tokens:
        surface = t.surface()
        pos = t.part_of_speech()[0]
        lemma = t.dictionary_form()

        token_list.append(surface)
        pos_list.append(pos)
        lemma_list.append(lemma)

        if pos in VALID_POS and lemma not in STOPWORDS:
            filtered.append(lemma)

    return {
        "original": text,
        "tokens": token_list,
        "pos_tags": pos_list,
        "lemmas": lemma_list,
        "processed_text": " ".join(filtered)
    }