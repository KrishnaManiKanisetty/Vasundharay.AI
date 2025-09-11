import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load data
df = pd.read_csv('crop_data.csv')

# Encode categorical features
le_soil = LabelEncoder()
df['soil_type'] = le_soil.fit_transform(df['soil_type'])

le_crop = LabelEncoder()
df['best_crop'] = le_crop.fit_transform(df['best_crop'])

# Features and target
X = df.drop('best_crop', axis=1)
y = df['best_crop']

# Scale numerical features
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Save everything
joblib.dump(model, 'crop_model.pkl')
joblib.dump(le_crop, 'label_encoder.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(le_soil, 'soil_encoder.pkl')

print("✅ Model trained and saved!")
print("Accuracy:", model.score(X_test, y_test))