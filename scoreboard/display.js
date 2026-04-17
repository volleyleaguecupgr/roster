// Display page - listens for localStorage changes and updates the UI

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

// Update the display based on state
function updateDisplay(state) {
    // Team 1
    document.getElementById('score-1').innerText = state.team1.score.toString().padStart(2, '0');
    document.getElementById('set-1').innerText = state.team1.sets;
    document.getElementById('team-name-1').textContent = state.team1.name;
    document.getElementById('team-logo-1').src = state.team1.logo;
    document.getElementById('color-1').style.backgroundColor = state.team1.color;
    
    document.getElementById('ball-1').style.display = state.team1.ball ? 'flex' : 'none';
    document.getElementById('set-point-chance-1').style.display = state.team1.setPoint ? 'flex' : 'none';
    document.getElementById('match-point-chance-1').style.display = state.team1.matchPoint ? 'flex' : 'none';
    document.getElementById('timeout-team-1').style.display = state.team1.timeout ? 'flex' : 'none';
    document.getElementById('challenge-team-1').style.display = state.team1.challenge ? 'flex' : 'none';
    
    document.getElementById('substitution-team-1').style.display = state.team1.sub.active ? 'flex' : 'none';
    document.getElementById('sub-num-1').style.display = state.team1.sub.active ? 'flex' : 'none';
    document.getElementById('sub-name-1').style.display = state.team1.sub.active ? 'flex' : 'none';
    document.getElementById('sub-num-1').textContent = state.team1.sub.number;
    document.getElementById('sub-name-1').textContent = state.team1.sub.name;
    
    // Team 2
    document.getElementById('score-2').innerText = state.team2.score.toString().padStart(2, '0');
    document.getElementById('set-2').innerText = state.team2.sets;
    document.getElementById('team-name-2').textContent = state.team2.name;
    document.getElementById('team-logo-2').src = state.team2.logo;
    document.getElementById('color-2').style.backgroundColor = state.team2.color;
    
    document.getElementById('ball-2').style.display = state.team2.ball ? 'flex' : 'none';
    document.getElementById('set-point-chance-2').style.display = state.team2.setPoint ? 'flex' : 'none';
    document.getElementById('match-point-chance-2').style.display = state.team2.matchPoint ? 'flex' : 'none';
    document.getElementById('timeout-team-2').style.display = state.team2.timeout ? 'flex' : 'none';
    document.getElementById('challenge-team-2').style.display = state.team2.challenge ? 'flex' : 'none';
    
    document.getElementById('substitution-team-2').style.display = state.team2.sub.active ? 'flex' : 'none';
    document.getElementById('sub-num-2').style.display = state.team2.sub.active ? 'flex' : 'none';
    document.getElementById('sub-name-2').style.display = state.team2.sub.active ? 'flex' : 'none';
    document.getElementById('sub-num-2').textContent = state.team2.sub.number;
    document.getElementById('sub-name-2').textContent = state.team2.sub.name;
}

// Initial load
const initialState = getState();
updateDisplay(initialState);

// Listen for changes from control panel
window.addEventListener('storage', function(e) {
    if (e.key === 'volleyballState' && e.newValue) {
        const newState = JSON.parse(e.newValue);
        updateDisplay(newState);
    }
});

// Also poll for changes (fallback for same-tab testing or if storage event doesn't fire)
setInterval(function() {
    const currentState = getState();
    updateDisplay(currentState);
}, 100); // Check every 100ms


function renderSetHistory() {
    const history = JSON.parse(localStorage.getItem('vb_setHistory') || '[]');
    const list    = document.getElementById('set-history-list');
    const panel   = document.getElementById('set-history-panel');

    const isVisible = localStorage.getItem('vb_history_visible') === 'true';
    if (panel) panel.style.display = isVisible ? 'block' : 'none';

    if (!list) return;

    // Calculate total sets won from history
    const sets1 = history.filter(s => s.winner === 1).length;
    const sets2 = history.filter(s => s.winner === 2).length;

    // Build final score header + set chips
    const finalScore = `
        <div class="set-final-score">
            <span class="${sets1 > sets2 ? 'set-winner' : ''}">${sets1}</span>
            <span style="color:#555"> – </span>
            <span class="${sets2 > sets1 ? 'set-winner' : ''}">${sets2}</span>
        </div>
    `;

    // Insert final score above the list
    const heading = document.querySelector('.set-history-heading');
    if (heading) {
        // Remove old final score if exists, then insert fresh
        const old = document.getElementById('set-final-score-el');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'set-final-score-el';
        div.innerHTML = finalScore;
        heading.after(div);
    }

    list.innerHTML = history.map(s => `
        <div class="set-history-entry">
            <span>SET ${s.setNum}</span><br>
            <span class="${s.winner === 1 ? 'set-winner' : ''}">${String(s.score1).padStart(2, '0')}</span>
            <span> – </span>
            <span class="${s.winner === 2 ? 'set-winner' : ''}">${String(s.score2).padStart(2, '0')}</span>
        </div>
    `).join('');
}

setInterval(renderSetHistory, 300);
