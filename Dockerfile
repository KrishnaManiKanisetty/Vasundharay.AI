# Use a Python base image with pre-installed scientific packages
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for pandas, numpy, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy your app files
COPY app.py .
COPY yield_predictor.pkl .

# Expose port
EXPOSE 8080

# Run the app
CMD ["python", "app.py"]