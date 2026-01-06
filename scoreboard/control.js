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

// Load saved input values
document.getElementById('team-name-1-input').value = state.team1.name;
document.getElementById('team-logo-url-1').value = state.team1.logo;
document.getElementById('team-color-1-input').value = state.team1.color;
document.getElementById('team-name-2-input').value = state.team2.name;
document.getElementById('team-logo-url-2').value = state.team2.logo;
document.getElementById('team-color-2-input').value = state.team2.color;

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

// Set Team 1 info
document.getElementById('set-logos-1').addEventListener('click', function() {
    const name = document.getElementById('team-name-1-input').value;
    const logo = document.getElementById('team-logo-url-1').value;
    const color = document.getElementById('team-color-1-input').value;
    
    if (name.trim() !== '') state.team1.name = name;
    if (logo.trim() !== '') state.team1.logo = logo;
    state.team1.color = color;
    
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

// Set Team 2 info
document.getElementById('set-logos-2').addEventListener('click', function() {
    const name = document.getElementById('team-name-2-input').value;
    const logo = document.getElementById('team-logo-url-2').value;
    const color = document.getElementById('team-color-2-input').value;
    
    if (name.trim() !== '') state.team2.name = name;
    if (logo.trim() !== '') state.team2.logo = logo;
    state.team2.color = color;
    
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
