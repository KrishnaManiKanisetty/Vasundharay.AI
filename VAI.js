// VAI.js - V.A.I AgriAdvisor | AI-Powered Crop Recommendation System
// Fully client-side logic with secure backend integration via Render
// Designed for https://vasundhara-ai.web.app

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const detectWeatherBtn = document.getElementById('detectWeatherBtn');
    const tempInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    const rainfallInput = document.getElementById('rainfall');
    const soilTypeSelect = document.getElementById('soilType');
    const statusText = document.getElementById('weatherStatus');
    const form = document.getElementById('cropForm');
    const progressFill = document.getElementById('progressFill');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const recommendationsContainer = document.getElementById('recommendations');
    const exportPdfBtn = document.getElementById('exportPdf');
    const shareWhatsappBtn = document.getElementById('shareWhatsapp');
    const toast = document.getElementById('toast');
    const loadingScreen = document.querySelector('.loading-screen');

    // 🔥 AI Backend API URL (Your Render Deployment)
    const AI_API_URL = 'https://agriadvisor-api.onrender.com/recommend';

    // Weather API Key (OpenWeatherMap)
    const WEATHER_API_KEY = '2cf8a92b2c71f2a47d7be76c35730d3d';

    // Hide loading screen after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }, 1000);
    });

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking links
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // Show Toast Notification
    function showToast(message, type = 'success') {
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast toast--${type}`;
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Update Progress Bar
    function updateProgress() {
        const requiredFields = ['soilType', 'ph', 'temperature', 'humidity', 'rainfall'];
        const filledFields = requiredFields.filter(id => {
            const el = document.getElementById(id);
            return el && el.value.trim() !== '';
        });
        const progress = (filledFields.length / requiredFields.length) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    // Add input listeners for progress tracking
    ['soilType', 'ph', 'temperature', 'humidity', 'rainfall'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateProgress);
            el.addEventListener('change', updateProgress);
        }
    });
    updateProgress();

    // Geolocation Weather Detection
    if (detectWeatherBtn) {
        detectWeatherBtn.addEventListener('click', async () => {
            if (!navigator.geolocation) {
                statusText.textContent = 'Geolocation not supported by your browser.';
                statusText.style.color = '#ef4444';
                showToast('Geolocation not available.', 'error');
                return;
            }

            // Disable button during detection
            detectWeatherBtn.disabled = true;
            detectWeatherBtn.innerHTML = '<span>📍 Detecting...</span>';
            statusText.textContent = 'Getting your location...';

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });

                const { latitude, longitude } = position.coords;
                statusText.textContent = 'Fetching weather data...';

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
                );

                if (!response.ok) throw new Error('Weather API error');

                const data = await response.json();

                // Update form fields
                if (tempInput) tempInput.value = Math.round(data.main.temp);
                if (humidityInput) humidityInput.value = Math.round(data.main.humidity);

                // Update UI
                const cityName = data.name;
                const climateZone = getClimateZone(data.main.temp, data.main.humidity);
                statusText.innerHTML = `
                    📍 ${cityName}: ${tempInput.value}°C, ${humidityInput.value}% humidity
                    <br><small>Climate: ${climateZone}</small>
                `;
                statusText.style.color = '#16a34a';

                // Update progress
                updateProgress();

            } catch (error) {
                console.error('Weather detection failed:', error);
                let message = 'Unable to retrieve weather data.';
                if (error.message?.includes('PERMISSION_DENIED')) {
                    message = 'Please allow location access.';
                } else if (error.message?.includes('TIMEOUT')) {
                    message = 'Location request timed out.';
                }
                statusText.textContent = message;
                statusText.style.color = '#ef4444';
                showToast(message, 'error');
            } finally {
                // Re-enable button
                detectWeatherBtn.disabled = false;
                detectWeatherBtn.innerHTML = '<span>📍 Detect</span>';
            }
        });
    }

    // Determine Climate Zone
    function getClimateZone(temp, humidity) {
        if (temp > 24 && humidity > 60) return "Tropical";
        if (temp > 20 && temp < 35 && humidity < 60) return "Arid";
        if (temp > 10 && temp < 25) return "Temperate";
        return "Unknown";
    }

    // Form Submission Handler
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect and validate inputs
        const soilType = soilTypeSelect?.value;
        const phValue = parseFloat(document.getElementById('ph')?.value);
        const tempValue = parseFloat(tempInput?.value);
        const humidityValue = parseFloat(humidityInput?.value);
        const rainfallValue = parseFloat(rainfallInput?.value);

        // Validation
        let isValid = true;
        const errors = {};

        if (!soilType) {
            errors.soilType = 'Please select a soil type';
            isValid = false;
        }

        if (isNaN(phValue) || phValue < 0 || phValue > 14) {
            errors.ph = 'pH must be between 0 and 14';
            isValid = false;
        }

        if (isNaN(rainfallValue) || rainfallValue < 0 || rainfallValue > 5000) {
            errors.rainfall = 'Rainfall must be between 0mm and 5000mm';
            isValid = false;
        }

        // Display errors
        if (!isValid) {
            if (errors.soilType) document.getElementById('soilTypeError').textContent = errors.soilType;
            if (errors.ph) document.getElementById('phError').textContent = errors.ph;
            if (errors.rainfall) document.getElementById('rainfallError').textContent = errors.rainfall;
            showToast('Please fix the errors in the form.', 'error');
            return;
        }

        // Clear previous errors
        document.getElementById('soilTypeError').textContent = '';
        document.getElementById('phError').textContent = '';
        document.getElementById('rainfallError').textContent = '';

        // Prepare form data
        const formData = {
            soilType,
            ph: phValue,
            temperature: tempValue,
            humidity: humidityValue,
            rainfall: rainfallValue,
            nitrogen: parseFloat(document.getElementById('nitrogen')?.value) || 50,
            phosphorus: parseFloat(document.getElementById('phosphorus')?.value) || 40,
            potassium: parseFloat(document.getElementById('potassium')?.value) || 35
        };

        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = '🧠 Analyzing with AI...';
        btnSpinner.classList.remove('hidden');

        try {
            // 🔥 Call your AI backend on Render
            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Handle non-JSON responses gracefully
            const textResponse = await response.text();
            let result;

            try {
                result = JSON.parse(textResponse);
            } catch (parseError) {
                console.error('Failed to parse JSON:', textResponse);
                throw new Error('Invalid response format from server');
            }

            if (!result.recommendations || !Array.isArray(result.recommendations)) {
                throw new Error('No valid recommendations received');
            }

            // Display AI-generated recommendations
            displayRecommendations(result.recommendations);

            // Show results section
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });

            // Save to local history
            saveToHistory(formData, result.recommendations);

            // Animate stats counters
            animateStats();

        } catch (error) {
            console.error('AI Recommendation Failed:', error);
            showToast('Could not connect to AI service. Showing sample recommendations.', 'error');

            // Fallback to mock recommendations
            const mockRecs = generateMockRecommendations(formData);
            displayRecommendations(mockRecs);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } finally {
            // Reset button
            submitBtn.disabled = false;
            btnText.textContent = '🌱 Get 5 Crop Recommendations';
            btnSpinner.classList.add('hidden');
        }
    });

    // Display Crop Recommendations
    function displayRecommendations(crops) {
        if (!recommendationsContainer) return;
        recommendationsContainer.innerHTML = '';

        crops.slice(0, 5).forEach((crop, index) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.style.animationDelay = `${index * 0.1}s`;

            const benefitsHtml = (crop.benefits || []).map(benefit =>
                `<div class="benefit-item">${benefit}</div>`
            ).join('');

            const detailsHtml = `
                <div class="detail-item">
                    <span class="detail-label">Growing Season</span>
                    <span class="detail-value">${crop.season || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Expected Yield</span>
                    <span class="detail-value">${crop.yield || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Water Needs</span>
                    <span class="detail-value">${crop.waterReq || 'Not specified'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Soil Type</span>
                    <span class="detail-value">${crop.soil || 'Not specified'}</span>
                </div>
            `;

            card.innerHTML = `
                <div class="card__header">
                    <div class="card__icon">🌱</div>
                    <div class="card__title-group">
                        <h3 class="card__title">${crop.name}</h3>
                        <div class="card__confidence">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${crop.confidence || 80}%"></div>
                            </div>
                            <span class="confidence-text">${crop.confidence || 80}% Match</span>
                        </div>
                    </div>
                </div>
                <div class="card__content">
                    <div class="card__benefits">
                        ${benefitsHtml}
                    </div>
                    <div class="card__details">
                        ${detailsHtml}
                    </div>
                </div>
            `;

            recommendationsContainer.appendChild(card);
        });
    }

    // Generate Mock Recommendations (Fallback)
    function generateMockRecommendations(formData) {
        const baseConfidence = 70 + Math.random() * 25;
        const crops = [
            { name: 'Rice', season: 'Monsoon', yield: '4-6 tons/hectare', waterReq: 'High (1500-2000mm)' },
            { name: 'Wheat', season: 'Winter', yield: '3-4 tons/hectare', waterReq: 'Medium (450-650mm)' },
            { name: 'Sugarcane', season: 'Year-round', yield: '60-80 tons/hectare', waterReq: 'High (1800-2500mm)' },
            { name: 'Cotton', season: 'Summer', yield: '1.5-2.5 tons/hectare', waterReq: 'Medium (700-1300mm)' },
            { name: 'Maize', season: 'Summer/Monsoon', yield: '5-7 tons/hectare', waterReq: 'Medium (500-800mm)' }
        ];

        return crops.map((crop, i) => ({
            ...crop,
            confidence: Math.round(baseConfidence + (5 - i) * 3),
            soil: `${formData.soilType.charAt(0).toUpperCase() + formData.soilType.slice(1)} preferred`,
            benefits: [
                `Well-suited for ${formData.soilType} soil`,
                `Thrives in ${formData.temperature}°C temperatures`,
                `Optimal for ${formData.rainfall}mm annual rainfall`
            ],
            tips: [
                'Monitor regularly for pests and diseases',
                'Apply fertilizers at recommended stages',
                'Ensure proper irrigation management'
            ]
        }));
    }

    // Save Submission History
    function saveToHistory(formData, recommendations) {
        const history = JSON.parse(localStorage.getItem('cropSubmissions') || '[]');
        history.push({
            id: Date.now(),
            formData,
            recommendations,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('cropSubmissions', JSON.stringify(history));
    }

    // Animate Stats Counters
    function animateStats() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'));
            let current = 0;
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / target));

            const timer = setInterval(() => {
                current += 1;
                el.textContent = new Intl.NumberFormat().format(current);
                if (current === target) clearInterval(timer);
            }, stepTime);
        });
    }

    // Export as PDF (Placeholder)
    exportPdfBtn?.addEventListener('click', () => {
        showToast('PDF export will be added using jsPDF.', 'success');
    });

    // Share on WhatsApp
    shareWhatsappBtn?.addEventListener('click', () => {
        const cropNames = Array.from(document.querySelectorAll('.card__title'))
            .slice(0, 3)
            .map(el => el.textContent)
            .join(', ');

        const message = encodeURIComponent(
            `🌾 V.A.I AgriAdvisor: Recommended crops for your farm: ${cropNames}. Get your personalized recommendations at https://vasundhara-ai.web.app`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
    });

    // Initialize
    updateProgress();
});