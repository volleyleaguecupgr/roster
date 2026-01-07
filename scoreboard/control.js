// Control panel - updates localStorage which the display page reads

// Initialize state from localStorage or use defaults
function getState() {
    const state = localStorage.getItem('volleyballState');
    if (state) {
        return JSON.parse(state);
    }
    return {
        team1: {
            score: 0,
            sets: 0,
            name: 'Team 1',
            logo: 'https://upload.wikimedia.org/wikipedia/el/5/52/PAOK_FC_%282013_logo%29.png',
            color: '#FF0000',
            ball: false,
            setPoint: false,
            matchPoint: false,
            timeout: false,
            challenge: false,
            sub: {
                active: false,
                number: '00',
                name: 'Player Name'
            }
        },
        team2: {
            score: 0,
            sets: 0,
            name: 'Team 2',
            logo: 'https://upload.wikimedia.org/wikipedia/el/5/52/PAOK_FC_%282013_logo%29.png',
            color: '#0000FF',
            ball: false,
            setPoint: false,
            matchPoint: false,
            timeout: false,
            challenge: false,
            sub: {
                active: false,
                number: '00',
                name: 'Player Name'
            }
        }
    };
}

// Extract dominant color from image
function getDominantColor(imageData, canvas, ctx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = function() {
            // Resize to small canvas for faster processing
            canvas.width = 100;
            canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            
            const data = ctx.getImageData(0, 0, 100, 100).data;
            const colorCount = {};
            
            // Sample colors (skip every 4th pixel for speed)
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Skip transparent or very light pixels
                if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
                
                // Round to reduce color variations
                const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
                colorCount[key] = (colorCount[key] || 0) + 1;
            }
            
            // Find most common color
            let maxCount = 0;
            let dominantColor = '0,0,0';
            for (const [color, count] of Object.entries(colorCount)) {
                if (count > maxCount) {
                    maxCount = count;
                    dominantColor = color;
                }
            }
            
            // Convert to hex
            const [r, g, b] = dominantColor.split(',').map(Number);
            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            resolve(hex);
        };
        
        img.onerror = function() {
            resolve('#FF0000'); // Fallback color
        };
        
        img.src = imageData;
    });
}

// Save state to localStorage
function saveState(state) {
    localStorage.setItem('volleyballState', JSON.stringify(state));
    updateControlDisplay(state);
}

// Update control panel display
function updateControlDisplay(state) {
    document.getElementById('display-score-1').textContent = state.team1.score.toString().padStart(2, '0');
    document.getElementById('display-set-1').textContent = state.team1.sets;
    document.getElementById('display-score-2').textContent = state.team2.score.toString().padStart(2, '0');
    document.getElementById('display-set-2').textContent = state.team2.sets;
}

// Initialize
let state = getState();
updateControlDisplay(state);

// Create canvas for color extraction
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Load saved input values
document.getElementById('team-name-1-input').value = state.team1.name;
document.getElementById('team-logo-url-1').value = state.team1.logo;
document.getElementById('team-name-2-input').value = state.team2.name;
document.getElementById('team-logo-url-2').value = state.team2.logo;

// Update previews on load
document.getElementById('logo-preview-1').src = state.team1.logo;
document.getElementById('logo-preview-2').src = state.team2.logo;
document.getElementById('color-preview-1').style.backgroundColor = state.team1.color;
document.getElementById('color-preview-2').style.backgroundColor = state.team2.color;

// Team 1 Logo Upload
let team1LogoData = state.team1.logo;
let team1Color = state.team1.color;

document.getElementById('logo-button-1').addEventListener('click', function() {
    document.getElementById('logo-file-1').click();
});

document.getElementById('logo-file-1').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const dataUrl = event.target.result;
            team1LogoData = dataUrl;
            
            // Update preview
            document.getElementById('logo-preview-1').src = dataUrl;
            
            // Extract color
            const color = await getDominantColor(dataUrl, canvas, ctx);
            team1Color = color;
            document.getElementById('color-preview-1').style.backgroundColor = color;
        };
        reader.readAsDataURL(file);
    }
});

// Team 1 Apply Button
document.getElementById('set-team-1-button').addEventListener('click', function() {
    const name = document.getElementById('team-name-1-input').value;
    const urlInput = document.getElementById('team-logo-url-1').value;
    
    if (name.trim() !== '') state.team1.name = name;
    
    // Use URL if provided, otherwise use uploaded file
    if (urlInput.trim() !== '') {
        state.team1.logo = urlInput;
        team1LogoData = urlInput;
    } else {
        state.team1.logo = team1LogoData;
    }
    
    state.team1.color = team1Color;
    saveState(state);
});

// Team 2 Logo Upload
let team2LogoData = state.team2.logo;
let team2Color = state.team2.color;

document.getElementById('logo-button-2').addEventListener('click', function() {
    document.getElementById('logo-file-2').click();
});

document.getElementById('logo-file-2').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const dataUrl = event.target.result;
            team2LogoData = dataUrl;
            
            // Update preview
            document.getElementById('logo-preview-2').src = dataUrl;
            
            // Extract color
            const color = await getDominantColor(dataUrl, canvas, ctx);
            team2Color = color;
            document.getElementById('color-preview-2').style.backgroundColor = color;
        };
        reader.readAsDataURL(file);
    }
});

// Team 2 Apply Button
document.getElementById('set-team-2-button').addEventListener('click', function() {
    const name = document.getElementById('team-name-2-input').value;
    const urlInput = document.getElementById('team-logo-url-2').value;
    
    if (name.trim() !== '') state.team2.name = name;
    
    // Use URL if provided, otherwise use uploaded file
    if (urlInput.trim() !== '') {
        state.team2.logo = urlInput;
        team2LogoData = urlInput;
    } else {
        state.team2.logo = team2LogoData;
    }
    
    state.team2.color = team2Color;
    saveState(state);
});

// Team 1 Controls

// Add point to Team 1
document.getElementById('add-point-1').addEventListener('click', function() {
    state.team1.score++;
    state.team1.ball = true;
    state.team2.ball = false;
    saveState(state);
});

// Remove point from Team 1
document.getElementById('remove-point-1').addEventListener('click', function() {
    if (state.team1.score > 0) {
        state.team1.score--;
        state.team1.ball = false;
    }
    saveState(state);
});

// Add set to Team 1
document.getElementById('set-team-1').addEventListener('click', function() {
    state.team1.sets++;
    saveState(state);
});

// Remove set from Team 1
document.getElementById('noset-team-1').addEventListener('click', function() {
    if (state.team1.sets > 0) {
        state.team1.sets--;
    }
    saveState(state);
});

// Reset Team 1 score
document.getElementById('reset-1').addEventListener('click', function() {
    state.team1.score = 0;
    saveState(state);
});

// Team 1 set point
document.getElementById('set-point-1').addEventListener('click', function() {
    state.team1.setPoint = !state.team1.setPoint;
    saveState(state);
});

// Team 1 match point
document.getElementById('match-point-1').addEventListener('click', function() {
    state.team1.matchPoint = !state.team1.matchPoint;
    saveState(state);
});

// Team 1 timeout
document.getElementById('timeout-1').addEventListener('click', function() {
    state.team1.timeout = !state.team1.timeout;
    saveState(state);
});

// Team 1 challenge
document.getElementById('challenge-1').addEventListener('click', function() {
    state.team1.challenge = !state.team1.challenge;
    saveState(state);
});

// Team 1 substitution
document.getElementById('sub-button-1').addEventListener('click', function() {
    const num = document.getElementById('sub-num-1-input').value;
    const name = document.getElementById('sub-name-1-input').value;
    
    if (num.trim() !== '') state.team1.sub.number = num;
    if (name.trim() !== '') state.team1.sub.name = name;
    
    state.team1.sub.active = !state.team1.sub.active;
    saveState(state);
});

// Team 2 Controls

// Add point to Team 2
document.getElementById('add-point-2').addEventListener('click', function() {
    state.team2.score++;
    state.team2.ball = true;
    state.team1.ball = false;
    saveState(state);
});

// Remove point from Team 2
document.getElementById('remove-point-2').addEventListener('click', function() {
    if (state.team2.score > 0) {
        state.team2.score--;
        state.team2.ball = false;
    }
    saveState(state);
});

// Add set to Team 2
document.getElementById('set-team-2').addEventListener('click', function() {
    state.team2.sets++;
    saveState(state);
});

// Remove set from Team 2
document.getElementById('noset-team-2').addEventListener('click', function() {
    if (state.team2.sets > 0) {
        state.team2.sets--;
    }
    saveState(state);
});

// Reset Team 2 score
document.getElementById('reset-2').addEventListener('click', function() {
    state.team2.score = 0;
    saveState(state);
});

// Team 2 set point
document.getElementById('set-point-2').addEventListener('click', function() {
    state.team2.setPoint = !state.team2.setPoint;
    saveState(state);
});

// Team 2 match point
document.getElementById('match-point-2').addEventListener('click', function() {
    state.team2.matchPoint = !state.team2.matchPoint;
    saveState(state);
});

// Team 2 timeout
document.getElementById('timeout-2').addEventListener('click', function() {
    state.team2.timeout = !state.team2.timeout;
    saveState(state);
});

// Team 2 challenge
document.getElementById('challenge-2').addEventListener('click', function() {
    state.team2.challenge = !state.team2.challenge;
    saveState(state);
});

// Team 2 substitution
document.getElementById('sub-button-2').addEventListener('click', function() {
    const num = document.getElementById('sub-num-2-input').value;
    const name = document.getElementById('sub-name-2-input').value;
    
    if (num.trim() !== '') state.team2.sub.number = num;
    if (name.trim() !== '') state.team2.sub.name = name;
    
    state.team2.sub.active = !state.team2.sub.active;
    saveState(state);
});
