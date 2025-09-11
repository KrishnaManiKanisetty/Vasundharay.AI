// Simple interactive behavior for the crop card.
// - populates plant icons
// - demo loads example crop data
// - calculates time-left to harvest and updates every second

// Helpers
function el(id){ return document.getElementById(id); }

// Create an inline SVG seedling icon element
function createPlantSVG(size = 28){
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = `
    <path fill="#2e7d3a" d="M12 2C9.8 2 8 3.8 8 6c0 2.2 1.8 4 4 4s4-1.8 4-4c0-2.2-1.8-4-4-4z"/>
    <path fill="#57b36a" d="M6 15c0 3.3 2.7 6 6 6 0 0-1-3 3-4 0 0-1.4-2-2.5-3.1C12.4 14 11 15 6 15z"/>
  `;
  const wrap = document.createElement('span');
  wrap.className = 'plant';
  wrap.appendChild(svg);
  return wrap;
}

// Fill the top plant row
function fillPlants(count = 6){
  const row = el('plantsRow');
  row.innerHTML = "";
  for(let i=0;i<count;i++){
    row.appendChild(createPlantSVG(28));
  }
}

// Time difference formatting
function timeDiffAsDHMS(endDate){
  // ensure both are Date objects
  const now = new Date();
  const end = (endDate instanceof Date) ? endDate : new Date(endDate);
  let diff = Math.max(0, end.getTime() - now.getTime()); // ms

  // compute days, hours, minutes, seconds
  const secTotal = Math.floor(diff / 1000);

  const days = Math.floor(secTotal / (24*3600));
  const hours = Math.floor((secTotal % (24*3600)) / 3600);
  const minutes = Math.floor((secTotal % 3600) / 60);
  const seconds = secTotal % 60;

  // format with leading zeros where useful
  function pad(n){ return n.toString().padStart(2,'0'); }
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

// Update countdown element continuously
let countdownTimer = null;
function startCountdown(endDate){
  if(countdownTimer) clearInterval(countdownTimer);
  const display = el('timeLeft');
  function tick(){
    const s = timeDiffAsDHMS(endDate);
    display.textContent = s;
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

// Demo sample loader
function loadSample(){
  // Example: planted 2025-08-01, harvest in 120 days from plant
  const samplePlantDate = new Date("2025-08-01T08:00:00");
  const harvestDays = 120;
  const harvestDate = new Date(samplePlantDate.getTime() + harvestDays * 24 * 3600 * 1000);

  el('cropName').textContent = "Sorghum (Jowar)";
  el('plantDate').textContent = samplePlantDate.toISOString().slice(0,10);
  // populate tips
  const tipsEl = el('farmingTips');
  tipsEl.innerHTML = "";
  [
    "Apply balanced NPK based on soil test.",
    "Irrigate deeply once a week during dry spells.",
    "Monitor pests weekly, use traps early."
  ].forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    tipsEl.appendChild(li);
  });
  // climate mock
  el('climateNow').querySelector('.temp').textContent = "29°C";
  el('climateNow').querySelector('.desc').textContent = "Sunny • Humidity 48%";

  startCountdown(harvestDate);
}

// Wire UI
document.addEventListener('DOMContentLoaded', function(){
  fillPlants(7);
  // default demo
  loadSample();

  // demo button
  el('demoBtn').addEventListener('click', loadSample);

  // edit button — simple prompt-based edit for quick demo
  el('editBtn').addEventListener('click', function(){
    const c = prompt("Crop name:", el('cropName').textContent) || el('cropName').textContent;
    const pd = prompt("Plant date (YYYY-MM-DD):", el('plantDate').textContent) || el('plantDate').textContent;
    const days = parseInt(prompt("Estimated days to harvest (number):", "90"), 10) || 90;

    el('cropName').textContent = c;
    el('plantDate').textContent = pd;
    // compute harvest
    const plantDateObj = new Date(pd + "T08:00:00");
    const harvest = new Date(plantDateObj.getTime() + days * 24 * 3600 * 1000);
    startCountdown(harvest);
  });
});
