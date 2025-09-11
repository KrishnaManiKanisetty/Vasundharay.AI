from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load model and preprocessors
model = joblib.load('crop_model.pkl')
le_crop = joblib.load('label_encoder.pkl')
scaler = joblib.load('scaler.pkl')
le_soil = joblib.load('soil_encoder.pkl')

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        
        # Handle soil type encoding
        soil_type = data['soilType']
        if soil_type not in le_soil.classes_:
            return jsonify({'error': 'Invalid soil type'}), 400
        
        soil_encoded = le_soil.transform([soil_type])[0]
        
        # Prepare input vector
        input_data = np.array([[soil_encoded,
                              data['ph'],
                              data['temperature'],
                              data['humidity'],
                              data['rainfall'],
                              data['nitrogen'],
                              data['phosphorus'],
                              data['potassium']]])
        
        # Scale
        input_scaled = scaler.transform(input_data)
        
        # Predict
        pred = model.predict(input_scaled)[0]
        crop_name = le_crop.inverse_transform([pred])[0]
        
        confidence = max(model.predict_proba(input_scaled)[0]) * 100
        
        # Return structured response
        recommendations = [
            {
                "name": crop_name,
                "confidence": round(confidence, 2),
                "season": "Monsoon" if crop_name in ["Rice", "Maize"] else "Winter",
                "yield": "High" if crop_name in ["Rice", "Sugarcane"] else "Medium",
                "waterReq": "High" if crop_name == "Rice" else "Medium",
                "soil": data['soilType'],
                "benefits": ["High yield potential", "Market demand"],
                "tips": ["Apply fertilizer at early stage"]
            }
        ]
        
        return jsonify({"recommendations": recommendations})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)