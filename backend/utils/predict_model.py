import sys
import json
import warnings
import os
import pickle

# Suppress sklearn version mismatch warnings
warnings.filterwarnings("ignore")

_model = None

def get_model():
    global _model
    if _model is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "model.pkl")
        with open(model_path, "rb") as f:
            _model = pickle.load(f)
    return _model

def predict(text):
    if not text or not str(text).strip():
        return {
            "success": False,
            "category": "General",
            "root_cause": "Unspecified civic issue",
            "confidence": 0.0
        }
    
    try:
        vectorizer, cat_model, rc_model = get_model()
        X = vectorizer.transform([str(text)])
        
        cat = cat_model.predict(X)[0]
        rc = rc_model.predict(X)[0]
        
        # Calculate max class probability as confidence
        try:
            cat_probs = cat_model.predict_proba(X)[0]
            confidence = float(max(cat_probs))
        except Exception:
            confidence = 1.0

        return {
            "success": True,
            "category": str(cat),
            "root_cause": str(rc),
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "category": "General",
            "root_cause": "Prediction error",
            "confidence": 0.0
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
    else:
        input_text = sys.stdin.read()
    
    result = predict(input_text)
    print(json.dumps(result))
