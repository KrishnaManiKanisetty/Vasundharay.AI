# yield_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

# Step 1: Create synthetic dataset with yield
data = {
    'nitrogen': [80, 60, 100, 40, 70, 90, 50, 110, 85, 65],
    'phosphorus': [45, 30, 60, 25, 50, 70, 35, 65, 55, 40],
    'potassium': [30, 20, 50, 15, 40, 60, 25, 55, 35, 28],
    'ph': [6.5, 7.0, 6.0, 5.5, 6.8, 7.2, 5.8, 6.3, 6.7, 6.1],
    'temperature': [28, 22, 32, 25, 30, 34, 20, 36, 27, 24],
    'humidity': [70, 60, 80, 50, 75, 85, 55, 90, 68, 62],
    'rainfall': [1200, 500, 1500, 300, 1000, 1800, 400, 2000, 1100, 600],
    'crop': ['rice', 'wheat', 'maize', 'millets', 'rice', 'cotton', 'wheat', 'rice', 'maize', 'millets']
}

# Add average yield per crop
yield_map = {
    'rice': 4.0,
    'wheat': 3.5,
    'maize': 5.2,
    'cotton': 2.5,
    'millets': 1.0
}

df = pd.DataFrame(data)
df['yield_ton_per_hectare'] = df['crop'].map(yield_map)

# Optional: Adjust yield based on ideal conditions
def adjust_yield(row, base_yield):
    score = 1.0
    if row['nitrogen'] < 60: score *= 0.7
    elif row['nitrogen'] > 100: score *= 0.9
    if row['phosphorus'] < 40: score *= 0.8
    if row['potassium'] < 30: score *= 0.85
    if abs(row['ph'] - 6.5) > 1.5: score *= 0.7
    if row['temperature'] < 20 or row['temperature'] > 35: score *= 0.6
    if row['humidity'] < 40 or row['humidity'] > 90: score *= 0.8
    if row['rainfall'] < 400: score *= 0.5
    elif row['rainfall'] < 800: score *= 0.8
    return base_yield * score

df['yield_ton_per_hectare'] = df.apply(
    lambda row: adjust_yield(row, yield_map[row['crop']]), axis=1
)

# Save clean data
df.to_csv('crop_yield_data.csv', index=False)

# Train model for each crop (or overall)
X = df[['nitrogen', 'phosphorus', 'potassium', 'ph', 'temperature', 'humidity', 'rainfall']]
y = df['yield_ton_per_hectare']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'yield_predictor.pkl')
print("✅ Model trained and saved!")