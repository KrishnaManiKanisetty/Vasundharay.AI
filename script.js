// ======================
// WAIT FOR PAGE TO LOAD
// ======================
document.addEventListener('DOMContentLoaded', function () {

    // ======================
    // CROP DATABASE
    // ======================
    const cropDatabase = {
        rice: {
            name: "Rice",
            image: "https://cdn-icons-png.flaticon.com/512/3075/3075828.png",
            season: "Kharif / Monsoon",
            temp: "25–35°C",
            water: "High (1000–1500 mm)",
            soil: "Clayey, pH 5–7",
            harvest: "90–120 days",
            tip: "Plant during early monsoon with 2–5 cm standing water. Apply nitrogen in 3 split doses.",
            climate: ["tropical", "humid"],
            soilPref: ["clayey"],
            scoreFactors: { rainfall: 0.3, temp: 0.25, humidity: 0.15, ph: 0.1, nitrogen: 0.1, potassium: 0.05, soil: 0.05 }
        },
        wheat: {
            name: "Wheat",
            image: "https://cdn-icons-png.flaticon.com/512/3075/3075895.png",
            season: "Rabi / Winter",
            temp: "15–25°C",
            water: "Moderate (500–750 mm)",
            soil: "Loamy, pH 6–7.5",
            harvest: "90–110 days",
            tip: "Sow in November–December. Requires well-drained soil and cool start.",
            climate: ["temperate"],
            soilPref: ["loamy"],
            scoreFactors: { temp: 0.25, ph: 0.2, nitrogen: 0.2, phosphorus: 0.15, rainfall: 0.1, soil: 0.05, humidity: 0.05 }
        },
        maize: {
            name: "Maize",
            image: "https://cdn-icons-png.flaticon.com/512/3075/3075848.png",
            season: "Kharif / Spring",
            temp: "21–30°C",
            water: "Moderate (600–800 mm)",
            soil: "Loamy, well-drained",
            harvest: "70–100 days",
            tip: "Ensure good spacing (60x20 cm). Protect from birds in early stage.",
            climate: ["temperate", "tropical"],
            soilPref: ["loamy"],
            scoreFactors: { temp: 0.2, nitrogen: 0.25, phosphorus: 0.2, ph: 0.1, rainfall: 0.1, soil: 0.05, humidity: 0.05 }
        },
        cotton: {
            name: "Cotton",
            image: "https://cdn-icons-png.flaticon.com/512/3075/3075904.png",
            season: "Kharif",
            temp: "25–35°C",
            water: "Moderate (700–1300 mm)",
            soil: "Black clayey or loamy",
            harvest: "150–180 days",
            tip: "Requires sunny weather during boll formation. Avoid waterlogging.",
            climate: ["tropical", "arid"],
            soilPref: ["clayey", "loamy"],
            scoreFactors: { temp: 0.2, ph: 0.15, nitrogen: 0.2, potassium: 0.15, rainfall: 0.1, soil: 0.1, humidity: 0.05 }
        },
        millets: {
            name: "Millets",
            image: "https://cdn-icons-png.flaticon.com/512/3075/3075856.png",
            season: "Kharif / Summer",
            temp: "25–40°C",
            water: "Low (300–500 mm)",
            soil: "Sandy loam to clayey",
            harvest: "60–90 days",
            tip: "Drought-resistant. Ideal for dry regions. Sow densely for better yield.",
            climate: ["arid", "tropical"],
            soilPref: ["sandy", "loamy"],
            scoreFactors: { temp: 0.15, rainfall: 0.1, nitrogen: 0.15, phosphorus: 0.15, soil: 0.1, ph: 0.1, humidity: 0.05 }
        }
    };

    // ======================
    // DOM ELEMENTS
    // ======================
    const detectWeatherBtn = document.getElementById('detectWeatherBtn');
    const tempInput = document.getElementById('temperature');
    const humidityInput = document.getElementById('humidity');
    const rainfallInput = document.getElementById('rainfall');
    const soilTypeSelect = document.getElementById('soilType');
    const statusText = document.getElementById('weatherStatus');
    const cropModal = document.getElementById('cropModal');
    const modalClose = document.getElementById('modalClose');
    const useThisCropBtn = document.getElementById('useThisCrop');

    // Modal fields
    const modalCropImage = document.getElementById('modalCropImage');
    const modalCropName = document.getElementById('modalCropName');
    const modalSeason = document.getElementById('modalSeason');
    const modalTemp = document.getElementById('modalTemp');
    const modalWater = document.getElementById('modalWater');
    const modalSoil = document.getElementById('modalSoil');
    const modalHarvest = document.getElementById('modalHarvest');
    const modalTip = document.getElementById('modalTip');

    // Firebase (if initialized above)
    const database = window.database || null; // Make sure Firebase is defined earlier

    // ======================
    // WEATHER & LOCATION
    // ======================
    const API_KEY = '2cf8a92b2c71f2a47d7be76c35730d3d'; // ✅ Your OpenWeatherMap API key

    if (!detectWeatherBtn) {
        console.error('❌ "Detect" button not found. Check ID.');
    } else {
        detectWeatherBtn.addEventListener('click', () => {
            console.log("📍 Detect button clicked!");

            if (!navigator.geolocation) {
                statusText.textContent = 'Geolocation is not supported.';
                statusText.style.color = 'red';
                return;
            }

            detectWeatherBtn.disabled = true;
            detectWeatherBtn.textContent = 'Detecting...';
            statusText.textContent = 'Getting your location...';

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log(`📍 Got location: ${latitude}, ${longitude}`);

                    try {
                        const res = await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                        );

                        if (!res.ok) {
                            throw new Error(`Weather API error: ${res.status}`);
                        }

                        const data = await res.json();
                        console.log("🌤️ Weather data:", data);

                        tempInput.value = Math.round(data.main.temp);
                        humidityInput.value = data.main.humidity;

                        const zone = getClimateZone(data.main.temp, data.main.humidity);
                        statusText.innerHTML = `📍 ${data.name}: ${tempInput.value}°C, ${humidityInput.value}% humidity<br><small>Climate: ${zone}</small>`;
                        statusText.style.color = '#4CAF50';
                    } catch (e) {
                        console.error("❌ Failed to get weather:", e);
                        statusText.textContent = 'Failed to get weather data.';
                        statusText.style.color = 'red';
                    } finally {
                        detectWeatherBtn.disabled = false;
                        detectWeatherBtn.textContent = '📍 Detect';
                    }
                },
                (err) => {
                    let msg = 'Unknown error';
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            msg = 'Please allow location access.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            msg = 'Location unavailable.';
                            break;
                        case err.TIMEOUT:
                            msg = 'Request timed out.';
                            break;
                        default:
                            msg = 'Location access denied or unavailable.';
                    }
                    statusText.textContent = msg;
                    statusText.style.color = 'red';
                    detectWeatherBtn.disabled = false;
                    detectWeatherBtn.textContent = '📍 Detect';
                }
            );
        });
    }

    // ======================
    // CLIMATE ZONE DETECTION
    // ======================
    function getClimateZone(temp, humidity) {
        if (temp > 24 && humidity > 60) return "tropical";
        if (temp > 20 && temp < 35 && humidity < 60) return "arid";
        if (temp > 10 && temp < 25) return "temperate";
        return "unknown";
    }

    // ======================
    // AI RECOMMENDATION ENGINE
    // ======================
    function recommendCrop(formData) {
        let bestCrop = null;
        let highestScore = -1;
        const zone = getClimateZone(formData.temperature, formData.humidity);

        for (const [key, crop] of Object.entries(cropDatabase)) {
            let score = 0;

            if (crop.climate.includes(zone)) score += 0.2;
            if (crop.soilPref.includes(formData.soilType)) score += 0.1;

            for (const [factor, weight] of Object.entries(crop.scoreFactors)) {
                const value = formData[factor];
                if (value > 0) score += weight * (value / 200);
            }

            if (crop.water.includes("High")) score *= (formData.rainfall > 1000 ? 1.2 : 0.7);
            if (crop.water.includes("Low")) score *= (formData.rainfall < 600 ? 1.2 : 0.8);

            if (score > highestScore) {
                highestScore = score;
                bestCrop = crop;
            }
        }
        return bestCrop;
    }

    // ======================
    // MODAL: SHOW CROP DETAILS
    // ======================
    function showCropModal(crop) {
        modalCropImage.src = crop.image.trim(); // Remove extra spaces
        modalCropName.textContent = crop.name;
        modalSeason.textContent = crop.season;
        modalTemp.textContent = crop.temp;
        modalWater.textContent = crop.water;
        modalSoil.textContent = crop.soil;
        modalHarvest.textContent = crop.harvest;
        modalTip.textContent = crop.tip;
        cropModal.classList.remove('hidden');
    }

    modalClose.addEventListener('click', () => {
        cropModal.classList.add('hidden');
    });

    useThisCropBtn.addEventListener('click', () => {
        document.getElementById('cropName').textContent = modalCropName.textContent;
        document.getElementById('resultCard').classList.remove('hidden');
        cropModal.classList.add('hidden');
    });

    // ======================
    // FORM SUBMISSION
    // ======================
    const form = document.getElementById('cropForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = {
                nitrogen: +document.getElementById('nitrogen').value,
                phosphorus: +document.getElementById('phosphorus').value,
                potassium: +document.getElementById('potassium').value,
                ph: +document.getElementById('ph').value,
                temperature: +document.getElementById('temperature').value,
                humidity: +document.getElementById('humidity').value,
                rainfall: +document.getElementById('rainfall').value,
                soilType: document.getElementById('soilType').value,
                timestamp: new Date().toISOString()
            };

            // Save to Firebase (if available)
            if (database) {
                database.ref('submissions/').push(formData)
                    .then(() => console.log("✅ Data saved to Firebase"))
                    .catch(err => console.error("❌ DB Error:", err));
            }

            // Save locally
            const history = JSON.parse(localStorage.getItem('cropSubmissions') || '[]');
            history.push({ ...formData, id: Date.now() });
            localStorage.setItem('cropSubmissions', JSON.stringify(history));

            // Show recommendation
            const recommendedCrop = recommendCrop(formData);
            if (recommendedCrop) {
                showCropModal(recommendedCrop);
            } else {
                alert("No suitable crop found. Try adjusting inputs.");
            }
            
            try {
    const yieldResponse = await fetch('http://localhost:5000/predict-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nitrogen: +document.getElementById('nitrogen').value,
            phosphorus: +document.getElementById('phosphorus').value,
            potassium: +document.getElementById('potassium').value,
            ph: +document.getElementById('ph').value,
            temperature: +document.getElementById('temperature').value,
            humidity: +document.getElementById('humidity').value,
            rainfall: +document.getElementById('rainfall').value
        })
    });

    const yieldData = await yieldResponse.json();

    if (yieldData.success) {
        // Show yield in modal or result card
        const yieldInfo = document.createElement('p');
        yieldInfo.innerHTML = `<strong>🎯 Predicted Yield:</strong> ${yieldData.predicted_yield_ton_per_hectare} tons/hectare`;
        document.querySelector('#resultCard .result-description').before(yieldInfo);
    }
} catch (err) {
    console.error("Failed to get yield prediction", err);
}


        });
    } else {
        console.warn('Form not found!');
    }
    

}
)
;

