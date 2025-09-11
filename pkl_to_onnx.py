import joblib
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import numpy as np

# -------------------------------
# 1. Load your trained .pkl model
# -------------------------------
model = joblib.load('crop_model.pkl')  # Replace with your model path

# If you also saved the label encoder, load it
try:
    label_encoder = joblib.load('label_encoder.pkl')
    class_names = label_encoder.classes_.tolist()
    print("Loaded class names:", class_names)
except:
    # Fallback: define class names manually
    class_names = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane']  # Update with your actual crops
    print("Using default class names:", class_names)

# ----------------------------------------
# 2. Define input shape (for ONNX conversion)
#    Must match training data structure
# ----------------------------------------

# Example input (used for tracing) - adjust feature count/order!
# [soil_encoded, ph, temperature, humidity, rainfall, nitrogen, phosphorus, potassium]
sample_input = np.array([[0, 6.5, 28.0, 70.0, 1200, 80, 45, 35]], dtype=np.float32)

# Define initial types for ONNX converter
initial_type = [('float_input', FloatTensorType([None, sample_input.shape[1]]))]

# ----------------------------------------
# 3. Convert to ONNX
# ----------------------------------------
onnx_model = convert_sklearn(
    model,
    name='CropRecommendationModel',
    initial_types=initial_type,
    target_opset=12,  # Stable opset version
    options={id(model): {'zipmap': False}}  # Important: Disable zipmap for simpler output
)

# ----------------------------------------
# 4. Save ONNX model
# ----------------------------------------
with open("crop_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("✅ Successfully converted .pkl to ONNX!")
print("📥 Saved as: crop_model.onnx")

# Optional: Test loading the ONNX model
try:
    import onnxruntime as rt

    sess = rt.InferenceSession("crop_model.onnx")
    input_name = sess.get_inputs()[0].name
    pred_onx = sess.run(None, {input_name: sample_input})[0]
    
    print("🎯 ONNX Model Prediction Test:", pred_onx)
    print("🎉 Conversion verified successfully!")
except Exception as e:
    print("⚠️ ONNX Runtime test failed:", str(e))
    print("Model still saved — install `onnxruntime` to test predictions.")