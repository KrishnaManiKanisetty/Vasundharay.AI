# convert_to_onnx.py
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import joblib
import numpy as np

# Load your trained model
model = joblib.load('yield_predictor.pkl')

# Define input schema (7 features)
initial_type = [('float_input', FloatTensorType([None, 7]))]

# Convert to ONNX
onnx_model = convert_sklearn(model, initial_types=initial_type)

# Save ONNX model
with open("yield_model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("✅ Model converted to ONNX: yield_model.onnx")