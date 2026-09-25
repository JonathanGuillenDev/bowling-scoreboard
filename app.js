// --- AUDIO UTILITY ---
let currentMusic = null;

function playSound(file, volume = 1.0) {
    const audio = new Audio(file);
    audio.volume = volume;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

function playMusic(file, volume = 1.0) {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    currentMusic = new Audio(file);
    currentMusic.volume = volume;
    currentMusic.play().catch(e => console.log("Music play failed:", e));
}

class BowlingEngine {
    constructor(players) {
        this.players = players; // Array of {name: string}
        this.rolls = {}; // { playerName: [roll1, roll2, ...] }
        this.currentPlayerIndex = 0;
        this.currentFrame = 1;
        this.rollInFrame = 1;

        players.forEach(p => {
            this.rolls[p.name] = [];
        });
    }

    submitRoll(pins) {
        const playerName = this.players[this.currentPlayerIndex].name;
        this.rolls[playerName].push(pins);
        this.updateState();
    }

    updateState() {
        const playerName = this.players[this.currentPlayerIndex].name;
        const frameRolls = this.getRollsForFrame(playerName, this.currentFrame);
        
        if (this.currentFrame < 10) {
            if (frameRolls.length === 1 && frameRolls[0] === 10) {
                this.nextTurn();
            } else if (frameRolls.length === 2) {
                this.nextTurn();
            }
        } else {
            // 10th Frame Special Rules
            if (frameRolls.length === 2 && (frameRolls[0] + frameRolls[1] < 10)) {
                this.nextTurn();
            } else if (frameRolls.length === 3) {
                this.nextTurn();
            }
        }
    }

    nextTurn() {
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.currentFrame++;
        }
        if (this.currentFrame > 10) {
            this.gameState = 'FINISHED';
        }
    }

    getRollsForFrame(playerName, frame) {
        const rolls = this.rolls[playerName];
        let rollIdx = 0;
        for (let f = 1; f < frame; f++) {
            if (rollIdx >= rolls.length) break;
            if (rolls[rollIdx] === 10) {
                rollIdx += 1;
            } else {
                rollIdx += 2;
            }
        }
        
        const frameRolls = [];
        if (frame < 10) {
            if (rolls[rollIdx] !== undefined) {
                frameRolls.push(rolls[rollIdx]);
                if (rolls[rollIdx] === 10) {
                    // Strike: frame is over
                } else if (rolls[rollIdx + 1] !== undefined) {
                    frameRolls.push(rolls[rollIdx + 1]);
                }
            }
        } else {
            // 10th Frame: can have up to 3 rolls
            if (rolls[rollIdx] !== undefined) frameRolls.push(rolls[rollIdx]);
            if (rolls[rollIdx + 1] !== undefined) frameRolls.push(rolls[rollIdx + 1]);
            if (rolls[rollIdx + 2] !== undefined) frameRolls.push(rolls[rollIdx + 2]);
        }
        return frameRolls;
    }

    getRemainingPins() {
        const playerName = this.players[this.currentPlayerIndex].name;
        const rolls = this.rolls[playerName];
        
        if (this.currentFrame === 10) return 10;

        const frameRolls = this.getRollsForFrame(playerName, this.currentFrame);
        if (frameRolls.length === 0) return 10;
        if (frameRolls.length === 1 && frameRolls[0] < 10) {
            return 10 - frameRolls[0];
        }
        return 10;
    }

    getCurrentBall() {
        const playerName = this.players[this.currentPlayerIndex].name;
        const rolls = this.rolls[playerName];
        const frameRolls = this.getRollsForFrame(playerName, this.currentFrame);
        return frameRolls.length + 1;
    }
    calculateScore(playerName) {
        const rolls = this.rolls[playerName];
        let total = 0;
        let rollIdx = 0;

        for (let frame = 0; frame < 10; frame++) {
            if (rollIdx >= rolls.length) break;

            if (rolls[rollIdx] === 10) { // Strike
                total += 10 + (rolls[rollIdx + 1] || 0) + (rolls[rollIdx + 2] || 0);
                rollIdx += 1;
            } else if (rolls[rollIdx] + (rolls[rollIdx + 1] || 0) === 10) { // Spare
                total += 10 + (rolls[rollIdx + 2] || 0);
                rollIdx += 2;
            } else {
                total += (rolls[rollIdx] || 0) + (rolls[rollIdx + 1] || 0);
                rollIdx += 2;
            }
        }
        return total;
    }

    getFrameData(playerName, frame) {
        const rolls = this.rolls[playerName];
        let rollIdx = 0;
        let totalUpToFrame = 0;

        for (let f = 1; f < frame; f++) {
            if (rollIdx >= rolls.length) break;

            if (rolls[rollIdx] === 10) {
                if (rolls[rollIdx + 1] === undefined || rolls[rollIdx + 2] === undefined) {
                    return { rolls: [], score: '--' };
                }
                totalUpToFrame += 10 + rolls[rollIdx + 1] + rolls[rollIdx + 2];
                rollIdx += 1;
            } else if (rolls[rollIdx] + (rolls[rollIdx + 1] || 0) === 10) {
                if (rolls[rollIdx + 2] === undefined) {
                    return { rolls: [], score: '--' };
                }
                totalUpToFrame += 10 + rolls[rollIdx + 2];
                rollIdx += 2;
            } else {
                totalUpToFrame += (rolls[rollIdx] || 0) + (rolls[rollIdx + 1] || 0);
                rollIdx += 2;
            }
        }

        const r1 = rolls[rollIdx];
        const r2 = rolls[rollIdx + 1];
        
        let display = { rolls: [], score: '--' };
        if (r1 === undefined) return display;

        if (r1 === 10) {
            display.rolls = ['X'];
            if (rolls[rollIdx + 1] !== undefined && rolls[rollIdx + 2] !== undefined) {
                display.score = totalUpToFrame + 10 + rolls[rollIdx + 1] + rolls[rollIdx + 2];
            }
        } else if (r2 !== undefined && r1 + r2 === 10) {
            display.rolls = [r1, '/'];
            if (rolls[rollIdx + 2] !== undefined) {
                display.score = totalUpToFrame + 10 + rolls[rollIdx + 2];
            }
        } else {
            display.rolls = [r1, r2 === undefined ? '' : r2];
            if (r2 !== undefined) {
                display.score = totalUpToFrame + r1 + r2;
            }
        }

        return display;
    }
}

// --- UI CONTROLLER ---

let game = null;
let playerCount = 1;
let isAnimating = false;

function renderAlley(ballY, pinsStanding, showBall = true) {
    const getPin = (index) => (index < pinsStanding ? "O" : " ");
    const getPinB = (index) => (index < pinsStanding ? "(_)" : "   ");

    const rows = [
        `  ${getPin(0)}     ${getPin(1)}     ${getPin(2)}     ${getPin(3)}  `,
        ` ${getPinB(0)} ${getPin(4)} ${getPinB(1)} ${getPin(5)} ${getPinB(2)} ${getPin(6)} ${getPinB(3)} `,
        `    ${getPinB(4)} ${getPin(7)} ${getPinB(5)} ${getPin(8)} ${getPinB(6)}    `,
        `       ${getPinB(7)} ${getPin(9)} ${getPinB(8)}       `,
        `          ${getPinB(9)}          `
    ];

    let output = "_________________________\n";
    for (let r of rows) {
        output += `/ ${r} \\\n`;
    }
    output += "/______________________\\\n";

    for (let i = 0; i < 15; i++) {
        if (showBall && i === ballY) {
            output += "| |         O        | |\n";
        } else {
            output += "| |                  | |\n";
        }
    }

    if (showBall && ballY === 0) {
        output += "|______________________|";
    } else {
        output += "|_|__________________|_|";
    }

    return output;
}

async function animateRoll(pinsKnocked) {
    isAnimating = true;
    const alley = document.getElementById('ascii-alley');
    
    // 1. Start with pins currently standing in the frame
    const playerName = game.players[game.currentPlayerIndex].name;
    const frameRolls = game.getRollsForFrame(playerName, game.currentFrame);
    
    // Calculate pins currently standing before this roll
    let pinsAtStart = 10;
    if (frameRolls.length > 0) {
        // In a standard frame, pins standing = 10 - first roll
        // If it's 10th frame and we are on ball 2 or 3, it's more complex,
        // but for visual purposes, we'll track the current frame state.
        pinsAtStart = 10 - (frameRolls.reduce((a, b) => a + b, 0));
        // Ensure it doesn't go negative
        pinsAtStart = Math.max(0, pinsAtStart);
    }
    
    // Special case: 10th frame Ball 3 resets to 10
    if (game.currentFrame === 10 && game.getCurrentBall() === 3) {
        pinsAtStart = 10;
    }
    
    // Ball rolls up - show pins standing at start of roll
    for(let y=14; y>=0; y--) {
        alley.innerText = renderAlley(y, pinsAtStart, true);
        await new Promise(r => setTimeout(r, 20));
    }
    
    // 2. Impact: Subtract the pins just knocked down
    const pinsRemaining = Math.max(0, pinsAtStart - pinsKnocked);
    alley.innerText = renderAlley(0, pinsRemaining, true);
    await new Promise(r => setTimeout(r, 300));

    // Trigger sounds based on the roll outcome
    if (pinsKnocked === 10) {
        playSound('assets/strike.wav', .55);
    } else if (pinsKnocked === 0) {
        playSound('assets/gutter.wav', .75);
    } else {
        const currentFrameRolls = game.getRollsForFrame(playerName, game.currentFrame);
        const totalPinsInFrame = currentFrameRolls.reduce((a, b) => a + b, 0) + pinsKnocked;
        if (totalPinsInFrame === 10 && currentFrameRolls.length > 0) {
            playSound('assets/spare.wav', .75);
        }
    }
    
    isAnimating = false;
}

function changePlayerCount(delta) {
    playSound('assets/click.wav', .55);
    playerCount = Math.max(1, Math.min(4, playerCount + delta));
    document.getElementById('player-count').innerText = playerCount;
    
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 1; i <= playerCount; i++) {
        container.innerHTML += `
            <div class="name-input-group">
                <label>P${i} NAME:</label>
                    <input type="text" class="retro-input" maxlength="8" placeholder="PLAYER ${i}">

            </div>
        `;
    }
}

// ... existing code ...
document.getElementById('start-game-btn').addEventListener('click', () => {
    playSound('assets/click.wav', .55);
    const nameInputs = document.querySelectorAll('.retro-input');
    const players = Array.from(nameInputs).map((input, i) => ({ name: input.value || `PLAYER ${i + 1}` }));
    
    game = new BowlingEngine(players);
    
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    playMusic('assets/game-play.mp3', 0.35);
    initScoreboard();
    updateUI();
});

document.getElementById('restart-game-btn').addEventListener('click', () => {
    resetToSetup();
});

document.getElementById('play-again-btn').addEventListener('click', () => {
    resetToSetup();
});

function resetToSetup() {
    playSound('assets/click.wav', .55);
    playMusic('assets/title-screen.mp3', 0.9);
    game = null;
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const setup = document.getElementById('setup-screen');
    setup.classList.add('active');
    setup.classList.remove('fade-in');
    void setup.offsetWidth; // Trigger reflow to restart animation
    setup.classList.add('fade-in');
    
    changePlayerCount(1);
}

function initScoreboard() {
// ... existing code ...
    const body = document.getElementById('scoreboard-body');
    body.innerHTML = '';
    game.players.forEach(p => {
        let row = `<tr id="row-${p.name}"><td>${p.name}</td>`;
        for (let i = 1; i <= 10; i++) {
            row += `<td class="frame-cell" data-frame="${i}">--</td>`;
        }
        row += `<td class="total-cell">--</td></tr>`;
        body.innerHTML += row;
    });
}

function updateUI() {
    if (!game) return;

    const turnDisplay = document.getElementById('current-turn-display');
    if (turnDisplay) {
        turnDisplay.style.display = game.players.length > 1 ? 'block' : 'none';
        turnDisplay.innerText = `${game.players[game.currentPlayerIndex].name}'s TURN`;
    }
    document.getElementById('frame-display').innerText = `FRAME ${game.currentFrame}`;

    // Update prompt
    const ballNum = game.getCurrentBall();
    document.querySelector('.prompt').innerHTML = `<span class="ball-count">Ball ${ballNum}</span><br>Enter pins knocked`;

    game.players.forEach(p => {
        const row = document.getElementById(`row-${p.name}`);
        const cells = row.querySelectorAll('.frame-cell');
        
        // Update frame cells
        for (let i = 1; i <= 10; i++) {
            const data = game.getFrameData(p.name, i);
            const cell = cells[i-1];
            
            // Display rolls only
            cell.innerHTML = `<div>${data.rolls.join(' ') || '--'}</div>`;
            
            if (i === game.currentFrame && p.name === game.players[game.currentPlayerIndex].name) {
                cell.classList.add('current-frame');
            } else {
                cell.classList.remove('current-frame');
            }
        }
        
        // Update total
        const total = game.calculateScore(p.name);
        row.querySelector('.total-cell').innerText = total === 0 && game.rolls[p.name].length === 0 ? '--' : total;
    });

    // Update keypad buttons
    const remainingPins = game.getRemainingPins();
    document.querySelectorAll('.key').forEach(key => {
        const val = parseInt(key.dataset.val);
        key.disabled = (game.currentFrame < 10 && val > remainingPins);
    });

    // Reset alley to idle state with actual pins standing
    const playerName = game.players[game.currentPlayerIndex].name;
    const frameRolls = game.getRollsForFrame(playerName, game.currentFrame);
    let pinsStanding = 10 - (frameRolls.reduce((a, b) => a + b, 0));
    pinsStanding = Math.max(0, pinsStanding);

    // 10th Frame Ball 3 Exception: visual reset to 10
    if (game.currentFrame === 10 && game.getCurrentBall() === 3) {
        pinsStanding = 10;
    }

    document.getElementById('ascii-alley').innerText = renderAlley(14, pinsStanding, false);

    if (game.currentFrame > 10) {
        endGame();
    }
}

// Keypad implementation
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', async (e) => {
        playSound('assets/click.wav', .55);
        if (isAnimating) return;
        
        const val = parseInt(e.target.dataset.val);
        
        // Animate first
        await animateRoll(val);
        
        game.submitRoll(val);
        updateUI();
    });
});

function endGame() {
    playMusic('assets/golden-score.mp3', 0.95);
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('game-over-screen').classList.add('active');
    
    const rankTop = document.getElementById('rank-top');
    const rankBottom = document.getElementById('rank-bottom');
    rankTop.innerHTML = '';
    rankBottom.innerHTML = '';
    
    const sorted = [...game.players].sort((a, b) => game.calculateScore(b.name) - game.calculateScore(a.name));
    
    if (sorted.length > 0) {
        const winner = sorted[0];
        rankTop.innerHTML = `<div style="margin: 1rem 0; font-size: 1.5rem">${winner.name}: ${game.calculateScore(winner.name)}</div>`;
        
        for (let i = 1; i < sorted.length; i++) {
            const p = sorted[i];
            rankBottom.innerHTML += `<div style="margin: 1rem 0; font-size: 1.5rem">${i+1}. ${p.name}: ${game.calculateScore(p.name)}</div>`;
        }
    }
}

// Initial setup
document.getElementById('run-game-btn').addEventListener('click', () => {
    playMusic('assets/title-screen.mp3', 0.9);
    const splash = document.getElementById('splash-screen');
    const setup = document.getElementById('setup-screen');
    
    splash.classList.remove('active');
    setup.classList.add('active');
    setup.classList.add('fade-in');
});

changePlayerCount(0);