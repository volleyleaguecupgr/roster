// Control panel - updates localStorage which the display page reads

// ── Toggle history visibility on display ──────────────────
let historyVisible = false;
document.getElementById('toggle-history').addEventListener('click', () => {
    historyVisible = !historyVisible;
    localStorage.setItem('vb_history_visible', historyVisible);
    document.getElementById('toggle-history').textContent =
        historyVisible ? '📋 HIDE SETS' : '📋 SHOW SETS';
});

// Initialize state from localStorage or use defaults
function getState() {
    const state = localStorage.getItem('volleyballState');
    if (state) return JSON.parse(state);
    return {
        team1: {
            score: 0, sets: 0,
            name: 'Team 1',
            logo: 'https://upload.wikimedia.org/wikipedia/el/5/52/PAOK_FC_%282013_logo%29.png',
            color: '#FF0000',
            ball: false, setPoint: false, matchPoint: false,
            timeout: false, challenge: false,
            sub: { active: false, number: '00', name: 'Player Name' }
        },
        team2: {
            score: 0, sets: 0,
            name: 'Team 2',
            logo: 'https://upload.wikimedia.org/wikipedia/el/5/52/PAOK_FC_%282013_logo%29.png',
            color: '#0000FF',
            ball: false, setPoint: false, matchPoint: false,
            timeout: false, challenge: false,
            sub: { active: false, number: '00', name: 'Player Name' }
        }
    };
}

// Extract dominant color from image
function getDominantColor(imageData, canvas, ctx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            canvas.width = 100; canvas.height = 100;
            ctx.drawImage(img, 0, 0, 100, 100);
            const data = ctx.getImageData(0, 0, 100, 100).data;
            const colorCount = {};
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
                const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`;
                colorCount[key] = (colorCount[key] || 0) + 1;
            }
            let maxCount = 0, dominantColor = '0,0,0';
            for (const [color, count] of Object.entries(colorCount)) {
                if (count > maxCount) { maxCount = count; dominantColor = color; }
            }
            const [r, g, b] = dominantColor.split(',').map(Number);
            resolve('#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''));
        };
        img.onerror = () => resolve('#FF0000');
        img.src = imageData;
    });
}

function saveState(state) {
    localStorage.setItem('volleyballState', JSON.stringify(state));
    updateControlDisplay(state);
}

function updateControlDisplay(state) {
    document.getElementById('display-score-1').textContent = state.team1.score.toString().padStart(2, '0');
    document.getElementById('display-set-1').textContent   = state.team1.sets;
    document.getElementById('display-score-2').textContent = state.team2.score.toString().padStart(2, '0');
    document.getElementById('display-set-2').textContent   = state.team2.sets;
}

let state = getState();
updateControlDisplay(state);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

document.getElementById('team-name-1-input').value = state.team1.name;
document.getElementById('team-logo-url-1').value   = state.team1.logo;
document.getElementById('team-name-2-input').value = state.team2.name;
document.getElementById('team-logo-url-2').value   = state.team2.logo;
document.getElementById('logo-preview-1').src = state.team1.logo;
document.getElementById('logo-preview-2').src = state.team2.logo;
document.getElementById('color-preview-1').style.backgroundColor = state.team1.color;
document.getElementById('color-preview-2').style.backgroundColor = state.team2.color;

// ── Team 1 Logo ───────────────────────────────────────────
let team1LogoData = state.team1.logo;
let team1Color    = state.team1.color;

document.getElementById('logo-button-1').addEventListener('click', () =>
    document.getElementById('logo-file-1').click());

document.getElementById('logo-file-1').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        team1LogoData = ev.target.result;
        document.getElementById('logo-preview-1').src = team1LogoData;
        team1Color = await getDominantColor(team1LogoData, canvas, ctx);
        document.getElementById('color-preview-1').style.backgroundColor = team1Color;
    };
    reader.readAsDataURL(file);
});

document.getElementById('set-team-1-button').addEventListener('click', () => {
    const name = document.getElementById('team-name-1-input').value;
    const url  = document.getElementById('team-logo-url-1').value;
    if (name.trim()) state.team1.name = name;
    if (url.trim())  { state.team1.logo = url; team1LogoData = url; }
    else               state.team1.logo = team1LogoData;
    state.team1.color = team1Color;
    saveState(state);
});

// ── Team 2 Logo ───────────────────────────────────────────
let team2LogoData = state.team2.logo;
let team2Color    = state.team2.color;

document.getElementById('logo-button-2').addEventListener('click', () =>
    document.getElementById('logo-file-2').click());

document.getElementById('logo-file-2').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
        team2LogoData = ev.target.result;
        document.getElementById('logo-preview-2').src = team2LogoData;
        team2Color = await getDominantColor(team2LogoData, canvas, ctx);
        document.getElementById('color-preview-2').style.backgroundColor = team2Color;
    };
    reader.readAsDataURL(file);
});

document.getElementById('set-team-2-button').addEventListener('click', () => {
    const name = document.getElementById('team-name-2-input').value;
    const url  = document.getElementById('team-logo-url-2').value;
    if (name.trim()) state.team2.name = name;
    if (url.trim())  { state.team2.logo = url; team2LogoData = url; }
    else               state.team2.logo = team2LogoData;
    state.team2.color = team2Color;
    saveState(state);
});

// ── Team 1 Controls ───────────────────────────────────────
document.getElementById('add-point-1').addEventListener('click', () => {
    state.team1.score++; state.team1.ball = true; state.team2.ball = false;
    saveState(state);
});
document.getElementById('remove-point-1').addEventListener('click', () => {
    if (state.team1.score > 0) { state.team1.score--; state.team1.ball = false; }
    saveState(state);
});
document.getElementById('set-team-1').addEventListener('click', () => {
    state.team1.sets++; saveState(state);
});
document.getElementById('noset-team-1').addEventListener('click', () => {
    if (state.team1.sets > 0) state.team1.sets--; saveState(state);
});
document.getElementById('reset-1').addEventListener('click', () => {
    state.team1.score = 0; saveState(state);
});
document.getElementById('set-point-1').addEventListener('click', () => {
    state.team1.setPoint = !state.team1.setPoint; saveState(state);
});
document.getElementById('match-point-1').addEventListener('click', () => {
    state.team1.matchPoint = !state.team1.matchPoint; saveState(state);
});
document.getElementById('timeout-1').addEventListener('click', () => {
    state.team1.timeout = !state.team1.timeout; saveState(state);
});
document.getElementById('challenge-1').addEventListener('click', () => {
    state.team1.challenge = !state.team1.challenge; saveState(state);
});
document.getElementById('sub-button-1').addEventListener('click', () => {
    const num  = document.getElementById('sub-num-1-input').value;
    const name = document.getElementById('sub-name-1-input').value;
    if (num.trim())  state.team1.sub.number = num;
    if (name.trim()) state.team1.sub.name   = name;
    state.team1.sub.active = !state.team1.sub.active;
    saveState(state);
});

// ── Team 2 Controls ───────────────────────────────────────
document.getElementById('add-point-2').addEventListener('click', () => {
    state.team2.score++; state.team2.ball = true; state.team1.ball = false;
    saveState(state);
});
document.getElementById('remove-point-2').addEventListener('click', () => {
    if (state.team2.score > 0) { state.team2.score--; state.team2.ball = false; }
    saveState(state);
});
document.getElementById('set-team-2').addEventListener('click', () => {
    state.team2.sets++; saveState(state);
});
document.getElementById('noset-team-2').addEventListener('click', () => {
    if (state.team2.sets > 0) state.team2.sets--; saveState(state);
});
document.getElementById('reset-2').addEventListener('click', () => {
    state.team2.score = 0; saveState(state);
});
document.getElementById('set-point-2').addEventListener('click', () => {
    state.team2.setPoint = !state.team2.setPoint; saveState(state);
});
document.getElementById('match-point-2').addEventListener('click', () => {
    state.team2.matchPoint = !state.team2.matchPoint; saveState(state);
});
document.getElementById('timeout-2').addEventListener('click', () => {
    state.team2.timeout = !state.team2.timeout; saveState(state);
});
document.getElementById('challenge-2').addEventListener('click', () => {
    state.team2.challenge = !state.team2.challenge; saveState(state);
});
document.getElementById('sub-button-2').addEventListener('click', () => {
    const num  = document.getElementById('sub-num-2-input').value;
    const name = document.getElementById('sub-name-2-input').value;
    if (num.trim())  state.team2.sub.number = num;
    if (name.trim()) state.team2.sub.name   = name;
    state.team2.sub.active = !state.team2.sub.active;
    saveState(state);
});

// ── END SET ───────────────────────────────────────────────
// KEY FIX: use 'vb_setHistory' + 'setNum' to match display.js
document.getElementById('end-set').addEventListener('click', () => {
    const score1 = state.team1.score;
    const score2 = state.team2.score;
    const winner = score1 >= score2 ? 1 : 2;

    const history = JSON.parse(localStorage.getItem('vb_setHistory') || '[]');
    history.push({ setNum: history.length + 1, score1, score2, winner });
    localStorage.setItem('vb_setHistory', JSON.stringify(history));

    // Award the set to the winner
    if (winner === 1) state.team1.sets++;
    else              state.team2.sets++;

    // Reset scores and all indicators for next set
    state.team1.score = 0;       state.team2.score = 0;
    state.team1.setPoint  = false; state.team2.setPoint  = false;
    state.team1.matchPoint = false; state.team2.matchPoint = false;
    state.team1.timeout   = false; state.team2.timeout   = false;
    state.team1.challenge = false; state.team2.challenge = false;
    state.team1.sub.active = false; state.team2.sub.active = false;

    saveState(state);
});

// ── CLR HIST ──────────────────────────────────────────────
// KEY FIX: use 'vb_setHistory' to match display.js
document.getElementById('reset-history').addEventListener('click', () => {
    localStorage.removeItem('vb_setHistory');
});
