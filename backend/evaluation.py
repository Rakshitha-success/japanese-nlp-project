from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


def evaluate(y_true, y_pred):
    if len(y_true) == 0:
        return {
            "accuracy": 0,
            "precision": 0,
            "recall": 0,
            "f1": 0
        }

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average='weighted', zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average='weighted', zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
    }