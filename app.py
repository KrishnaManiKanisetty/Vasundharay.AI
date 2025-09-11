from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = joblib.load('yield_predictor.pkl')

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Crop Yield Prediction API",
        "status": "running",
        "endpoint": "/predict-yield"
    })

@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    try:
        data = request.json
        features = pd.DataFrame([{
            'nitrogen': data['nitrogen'],
            'phosphorus': data['phosphorus'],
            'potassium': data['potassium'],
            'ph': data['ph'],
            'temperature': data['temperature'],
            'humidity': data['humidity'],
            'rainfall': data['rainfall']
        }])

        prediction = model.predict(features)[0]
        return jsonify({
            "success": True,
            "predicted_yield_ton_per_hectare": round(prediction, 2)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080, debug=False)