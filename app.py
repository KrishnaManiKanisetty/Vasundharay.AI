# app.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS 

app = Flask(__name__)

# Load the trained model
model = joblib.load('yield_predictor.pkl')

@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    try:
        data = request.json
        
        # Extract features
        features = pd.DataFrame([{
            'nitrogen': data['nitrogen'],
            'phosphorus': data['phosphorus'],
            'potassium': data['potassium'],
            'ph': data['ph'],
            'temperature': data['temperature'],
            'humidity': data['humidity'],
            'rainfall': data['rainfall']
        }])

        # Predict
        prediction = model.predict(features)[0]
        return jsonify({
            'success': True,
            'predicted_yield_ton_per_hectare': round(prediction, 2)
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)