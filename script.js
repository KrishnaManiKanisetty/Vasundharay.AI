// ====== CROP DATABASE ======
const cropDatabase = {
    rice: {
        name: "Rice",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075828.png",
        season: "Kharif",
        temp: "25–35°C",
        water: "High",
        soil: ["clayey"],
        ph: "5.0–7.0",
        tips: "Plant during monsoon with standing water. Apply nitrogen in split doses."
    },
    wheat: {
        name: "Wheat",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075895.png",
        season: "Rabi",
        temp: "15–25°C",
        water: "Moderate",
        soil: ["loamy"],
        ph: "6.0–7.5",
        tips: "Sow in Nov-Dec. Needs cool start and well-drained soil."
    },
    maize: {
        name: "Maize",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075848.png",
        season: "Kharif/Spring",
        temp: "21–30°C",
        water: "Moderate",
        soil: ["loamy"],
        ph: "5.5–7.0",
        tips: "Ensure spacing 60x20 cm. Protect from birds in early stage."
    },
    cotton: {
        name: "Cotton",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075904.png",
        season: "Kharif",
        temp: "25–35°C",
        water: "Moderate",
        soil: ["clayey", "loamy"],
        ph: "6.0–8.0",
        tips: "Needs sunny weather during boll formation. Avoid waterlogging."
    },
    millets: {
        name: "Millets",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075856.png",
        season: "Kharif/Summer",
        temp: "25–40°C",
        water: "Low",
        soil: ["sandy", "loamy"],
        ph: "5.5–8.0",
        tips: "Drought-resistant. Ideal for dry regions. Sow densely."
    }
};

// ====== GET FORM DATA ======
function getFormData() {
    return {
        nitrogen: parseFloat(document.getElementById('nitrogen').value) || 50,
        phosphorus: parseFloat(document.getElementById('phosphorus').value) || 40,
        potassium: parseFloat(document.getElementById('potassium').value) || 35,
        ph: parseFloat(document.getElementById('ph').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        rainfall: parseFloat(document.getElementById('rainfall').value),
        soilType: document.getElementById('soilType').value
    };
}

// ====== CROP SCORING (Top 5) ======
function getTopCrops(formData) {
    const scores = Object.entries(cropDatabase)
        .map(([key, crop]) => {
            let score = 0;

            // Soil match
            if (crop.soil.includes(formData.soilType)) score += 20;

            // pH match
            const [minPh, maxPh] = crop.ph.split('–').map(Number);
            if (formData.ph >= minPh && formData.ph <= maxPh) score += 15;

            // Temp match
            const [minTemp, maxTemp] = crop.temp.split('–').map(t => parseFloat(t));
            if (formData.temperature >= minTemp && formData.temperature <= maxTemp) score += 20;

            // Water needs
            if (crop.water === "High" && formData.rainfall > 1000) score += 15;
            if (crop.water === "Low" && formData.rainfall < 800) score += 15;

            // Optional NPK boost
            if (formData.nitrogen > 70) score += 10;
            if (formData.phosphorus > 60) score += 10;
            if (formData.potassium > 50) score += 10;

            return { ...crop, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return scores;
}

// ====== HUGGING FACE AI EXPLANATION ======
async function generateExplanation(crop, formData) {
    const prompt = `
You are an agricultural expert. Explain in 1 sentence why ${crop.name} 
is suitable for a farm with:
- Soil: ${formData.soilType}
- pH: ${formData.ph}
- Temperature: ${formData.temperature}°C
- Humidity: ${formData.humidity}%
- Rainfall: ${formData.rainfall} mm
Keep it simple, helpful, and in plain language for farmers.
`;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-xl", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`HF Error: ${response.status}`);
        }

        const result = await response.json();
        return result[0]?.generated_text?.trim() || `Well-suited for your farm conditions.`;
    } catch (err) {
        console.error("Hugging Face API Error:", err);
        return `Ideal for your soil and climate conditions.`;
    }
}

// ====== DISPLAY 5 CROP CARDS ======
async function showCropRecommendations(formData) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    const topCrops = getTopCrops(formData);

    for (const crop of topCrops) {
        const explanation = await generateExplanation(crop, formData);

        const card = document.createElement('div');
        card.className = 'recommendation-card';

        card.innerHTML = `
            <div class="recommendation-card__header">
                <img src="${crop.image}" alt="${crop.name}" width="48" height="48">
                <div>
                    <h3>${crop.name}</h3>
                    <span class="recommendation-card__confidence">
                        Suitability: ${Math.round((crop.score / 100) * 100)}%
                    </span>
                </div>
            </div>
            <p style="margin: var(--space-16) 0; font-size: 0.9rem; color: var(--color-text-secondary);">
                ${explanation}
            </p>
            <div class="tip-box">💡 Tip: ${crop.tips}</div>
        `;

        container.appendChild(card);
    }

    document.getElementById('resultsSection').classList.remove('hidden');
}

// ====== FORM SUBMISSION ======
document.getElementById('cropForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading
    document.getElementById('btnText').textContent = 'Generating Recommendations...';
    document.getElementById('spinner').classList.remove('hidden');

    const formData = getFormData();
    await showCropRecommendations(formData);

    // Reset button
    document.getElementById('btnText').textContent = 'Get 5 Crop Recommendations';
    document.getElementById('spinner').classList.add('hidden');
});// ====== CROP DATABASE ======
const cropDatabase = {
    rice: {
        name: "Rice",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075828.png",
        season: "Kharif",
        temp: "25–35°C",
        water: "High",
        soil: ["clayey"],
        ph: "5.0–7.0",
        tips: "Plant during monsoon with standing water. Apply nitrogen in split doses."
    },
    wheat: {
        name: "Wheat",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075895.png",
        season: "Rabi",
        temp: "15–25°C",
        water: "Moderate",
        soil: ["loamy"],
        ph: "6.0–7.5",
        tips: "Sow in Nov-Dec. Needs cool start and well-drained soil."
    },
    maize: {
        name: "Maize",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075848.png",
        season: "Kharif/Spring",
        temp: "21–30°C",
        water: "Moderate",
        soil: ["loamy"],
        ph: "5.5–7.0",
        tips: "Ensure spacing 60x20 cm. Protect from birds in early stage."
    },
    cotton: {
        name: "Cotton",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075904.png",
        season: "Kharif",
        temp: "25–35°C",
        water: "Moderate",
        soil: ["clayey", "loamy"],
        ph: "6.0–8.0",
        tips: "Needs sunny weather during boll formation. Avoid waterlogging."
    },
    millets: {
        name: "Millets",
        image: "https://cdn-icons-png.flaticon.com/512/3075/3075856.png",
        season: "Kharif/Summer",
        temp: "25–40°C",
        water: "Low",
        soil: ["sandy", "loamy"],
        ph: "5.5–8.0",
        tips: "Drought-resistant. Ideal for dry regions. Sow densely."
    }
};

// ====== GET FORM DATA ======
function getFormData() {
    return {
        nitrogen: parseFloat(document.getElementById('nitrogen').value) || 50,
        phosphorus: parseFloat(document.getElementById('phosphorus').value) || 40,
        potassium: parseFloat(document.getElementById('potassium').value) || 35,
        ph: parseFloat(document.getElementById('ph').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        humidity: parseFloat(document.getElementById('humidity').value),
        rainfall: parseFloat(document.getElementById('rainfall').value),
        soilType: document.getElementById('soilType').value
    };
}

// ====== CROP SCORING (Top 5) ======
function getTopCrops(formData) {
    const scores = Object.entries(cropDatabase)
        .map(([key, crop]) => {
            let score = 0;

            // Soil match
            if (crop.soil.includes(formData.soilType)) score += 20;

            // pH match
            const [minPh, maxPh] = crop.ph.split('–').map(Number);
            if (formData.ph >= minPh && formData.ph <= maxPh) score += 15;

            // Temp match
            const [minTemp, maxTemp] = crop.temp.split('–').map(t => parseFloat(t));
            if (formData.temperature >= minTemp && formData.temperature <= maxTemp) score += 20;

            // Water needs
            if (crop.water === "High" && formData.rainfall > 1000) score += 15;
            if (crop.water === "Low" && formData.rainfall < 800) score += 15;

            // Optional NPK boost
            if (formData.nitrogen > 70) score += 10;
            if (formData.phosphorus > 60) score += 10;
            if (formData.potassium > 50) score += 10;

            return { ...crop, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return scores;
}

// ====== HUGGING FACE AI EXPLANATION ======
async function generateExplanation(crop, formData) {
    const prompt = `
You are an agricultural expert. Explain in 1 sentence why ${crop.name} 
is suitable for a farm with:
- Soil: ${formData.soilType}
- pH: ${formData.ph}
- Temperature: ${formData.temperature}°C
- Humidity: ${formData.humidity}%
- Rainfall: ${formData.rainfall} mm
Keep it simple, helpful, and in plain language for farmers.
`;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-xl", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`HF Error: ${response.status}`);
        }

        const result = await response.json();
        return result[0]?.generated_text?.trim() || `Well-suited for your farm conditions.`;
    } catch (err) {
        console.error("Hugging Face API Error:", err);
        return `Ideal for your soil and climate conditions.`;
    }
}

// ====== DISPLAY 5 CROP CARDS ======
async function showCropRecommendations(formData) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    const topCrops = getTopCrops(formData);

    for (const crop of topCrops) {
        const explanation = await generateExplanation(crop, formData);

        const card = document.createElement('div');
        card.className = 'recommendation-card';

        card.innerHTML = `
            <div class="recommendation-card__header">
                <img src="${crop.image}" alt="${crop.name}" width="48" height="48">
                <div>
                    <h3>${crop.name}</h3>
                    <span class="recommendation-card__confidence">
                        Suitability: ${Math.round((crop.score / 100) * 100)}%
                    </span>
                </div>
            </div>
            <p style="margin: var(--space-16) 0; font-size: 0.9rem; color: var(--color-text-secondary);">
                ${explanation}
            </p>
            <div class="tip-box">💡 Tip: ${crop.tips}</div>
        `;

        container.appendChild(card);
    }

    document.getElementById('resultsSection').classList.remove('hidden');
}

// ====== FORM SUBMISSION ======
document.getElementById('cropForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading
    document.getElementById('btnText').textContent = 'Generating Recommendations...';
    document.getElementById('spinner').classList.remove('hidden');

    const formData = getFormData();
    await showCropRecommendations(formData);

    // Reset button
    document.getElementById('btnText').textContent = 'Get 5 Crop Recommendations';
    document.getElementById('spinner').classList.add('hidden');
});