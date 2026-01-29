let secretNumber, attempts, attemptsList, maxRange = 100, gameActive = false;
let lastGuess = null, lastWasTooLow = false, wrongDirectionCount = 0;
let speedrunMode = false, startTime = null, timerInterval = null;

const elements = {
    startContainer: document.getElementById('startContainer'),
    difficultySelector: document.getElementById('difficultySelector'),
    gameForm: document.getElementById('gameForm'),
    gameInfo: document.getElementById('gameInfo'),
    rangeDisplay: document.getElementById('rangeDisplay'),
    attemptsCount: document.getElementById('attemptsCount'),
    attemptsContainer: document.getElementById('attemptsContainer'),
    attemptsList: document.getElementById('attemptsList'),
    feedback: document.getElementById('feedback'),
    guessInput: document.getElementById('guessInput'),
    errorMessage: document.getElementById('errorMessage'),
    tryAgainContainer: document.getElementById('tryAgainContainer'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    speedrunCheckbox: document.getElementById('speedrunMode'),
    timerContainer: document.getElementById('timerContainer'),
    timerDisplay: document.getElementById('timerDisplay'),
    highscoreContainer: document.getElementById('highscoreContainer'),
    highscoreDisplay: document.getElementById('highscoreDisplay'),
    speedrunHighscore: document.getElementById('speedrunHighscore'),
    menuHighscore: document.getElementById('menuHighscore')
};

function startGame() {
    secretNumber = Math.floor(Math.random() * maxRange) + 1;
    attempts = 0;
    attemptsList = [];
    gameActive = true;
    lastGuess = null;
    lastWasTooLow = false;
    wrongDirectionCount = 0;

    speedrunMode = elements.speedrunCheckbox.checked;

    toggleVisibility([elements.startContainer, elements.difficultySelector], false);
    toggleVisibility([elements.gameForm, elements.gameInfo], true);
    elements.rangeDisplay.textContent = `1-${maxRange}`;
    elements.attemptsCount.textContent = '0';
    elements.attemptsContainer.classList.add('hidden');
    elements.feedback.classList.remove('show');

    if (speedrunMode) {
        elements.timerContainer.classList.remove('hidden');
        elements.highscoreContainer.classList.remove('hidden');
        loadHighscore();
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
    } else {
        elements.timerContainer.classList.add('hidden');
        elements.highscoreContainer.classList.add('hidden');
    }

    elements.guessInput.focus();
}

function handleGuess(e) {
    e.preventDefault();
    if (!gameActive) return;

    const guess = parseInt(elements.guessInput.value);

    if (!elements.guessInput.value || isNaN(guess) || guess < 1 || guess > maxRange) {
        showError(`Zadej číslo mezi 1 a ${maxRange}!`);
        return;
    }

    attempts++;
    attemptsList.push(guess);
    updateAttempts();
    checkGuess(guess);

    elements.guessInput.value = '';
    elements.guessInput.classList.remove('error');
    elements.errorMessage.classList.remove('show');
    elements.guessInput.focus();
}

function checkGuess(guess) {
    if (guess === secretNumber) {
        gameWon();
        return;
    }

    if (lastWasTooLow && lastGuess !== null && guess < lastGuess) {
        wrongDirectionCount++;
        if (wrongDirectionCount >= 3) {
            showFeedback("Zlatíčko, když text píše moc nízko tak nepujdu ještě níž ne? Takhle přijímačky na vysokou školu neuděláš!", 'easter-egg');
            wrongDirectionCount = 0;
            lastGuess = guess;
            lastWasTooLow = guess < secretNumber;
            return;
        }
    } else {
        wrongDirectionCount = 0;
    }

    const difference = Math.abs(guess - secretNumber);
    const percentDiff = (difference / maxRange) * 100;

    let message = guess < secretNumber ? 'Moc nízko!' : 'Moc vysoko!';
    let hint, className;

    if (percentDiff <= 5) {
        hint = ' Hoří!';
        className = 'hot';
    } else if (percentDiff <= 15) {
        hint = ' Přihořívá!';
        className = 'warm';
    } else if (percentDiff <= 30) {
        hint = ' Chladno...';
        className = 'cold';
    } else {
        hint = ' Námraza! Zkus to znovu!';
        className = guess < secretNumber ? 'too-low' : 'too-high';
    }

    lastGuess = guess;
    lastWasTooLow = guess < secretNumber;

    showFeedback(message + hint, className);
}

function showFeedback(message, className) {
    elements.feedback.className = `feedback show ${className}`;
    elements.feedback.textContent = message;
}

function updateTimer() {
    if (!startTime) return;
    let elapsed = (Date.now() - startTime) / 1000;
    elements.timerDisplay.textContent = elapsed.toFixed(2) + 's';
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    return startTime ? (Date.now() - startTime) / 1000 : 0;
}

function getHighscoreKey() {
    return 'speedrunHighscore_' + maxRange;
}

function loadHighscore(animate) {
    let hs = localStorage.getItem(getHighscoreKey());
    let text = hs ? parseFloat(hs).toFixed(2) + 's' : '-';
    elements.highscoreDisplay.textContent = text;
    elements.menuHighscore.textContent = text;

    if (animate && hs) {
        elements.highscoreDisplay.classList.add('new-record');
        elements.menuHighscore.classList.add('new-record');
        setTimeout(() => {
            elements.highscoreDisplay.classList.remove('new-record');
            elements.menuHighscore.classList.remove('new-record');
        }, 1000);
    }
}

function saveHighscore(time) {
    let key = getHighscoreKey();
    let current = localStorage.getItem(key);
    if (!current || time < parseFloat(current)) {
        localStorage.setItem(key, time.toString());
        return true;
    }
    return false;
}

function gameWon() {
    gameActive = false;
    const attemptText = attempts === 1 ? 'pokus' : (attempts <= 4 ? 'pokusy' : 'pokusů');

    let finalTime = 0;
    let newRecord = false;

    if (speedrunMode) {
        finalTime = stopTimer();
        newRecord = saveHighscore(finalTime);
        loadHighscore(newRecord);

        if (newRecord) {
            showFeedback(`Gratuluji! Číslo ${secretNumber} za ${finalTime.toFixed(2)}s - NOVÝ REKORD!`, 'correct');
        } else {
            showFeedback(`Gratuluji! Číslo ${secretNumber} za ${finalTime.toFixed(2)}s (${attempts} ${attemptText})`, 'correct');
        }
    } else {
        showFeedback(`Gratuluji! Uhodl jsi číslo ${secretNumber} na ${attempts} ${attemptText}!`, 'correct');
    }

    elements.gameForm.style.display = 'none';
    elements.tryAgainContainer.classList.remove('hidden');
    saveToHistory(finalTime);
}

function updateAttempts() {
    elements.attemptsCount.textContent = attempts;
    elements.attemptsContainer.classList.remove('hidden');
    elements.attemptsList.innerHTML = attemptsList.map(num =>
        `<span class="attempt-badge">${num}</span>`
    ).join('');
}

function showError(message = 'Prosím, zadej platné číslo!') {
    elements.guessInput.classList.add('error');
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('show');
}

function resetGame() {
    stopTimer();
    startTime = null;
    toggleVisibility([elements.tryAgainContainer, elements.attemptsContainer, elements.gameInfo], false);
    toggleVisibility([elements.difficultySelector, elements.startContainer], true);
    elements.feedback.classList.remove('show');
    elements.guessInput.value = '';
    elements.timerDisplay.textContent = '0.00s';
}

function toggleVisibility(elementArray, show) {
    elementArray.forEach(el => {
        if (show) {
            el.classList.remove('hidden');
            if (el === elements.gameForm) el.style.display = 'block';
        } else {
            el.classList.add('hidden');
        }
    });
}

function saveToHistory(time) {
    const history = getHistory();
    let entry = {
        date: new Date().toLocaleString('cs-CZ'),
        attempts,
        secretNumber,
        attemptsList: [...attemptsList],
        range: maxRange
    };
    if (speedrunMode && time) {
        entry.speedrunTime = time;
    }
    history.unshift(entry);

    if (history.length > 10) history.pop();
    localStorage.setItem('guessGameHistory', JSON.stringify(history));
    loadHistory();
}

function getHistory() {
    const stored = localStorage.getItem('guessGameHistory');
    return stored ? JSON.parse(stored) : [];
}

function loadHistory() {
    const history = getHistory();
    
    if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-history">Zatím žádné dokončené hry...</p>';
        elements.clearHistoryBtn.classList.add('hidden');
        return;
    }

    elements.clearHistoryBtn.classList.remove('hidden');
    elements.historyList.innerHTML = history.map((game, index) => `
        <div class="history-item ${game.speedrunTime ? 'speedrun' : ''}">
            <div class="history-header">
                <span>Hra #${history.length - index}${game.speedrunTime ? ' ⏱️' : ''}</span>
                <span>${game.date}</span>
            </div>
            <div class="history-details">
                <p><strong>Tajné číslo:</strong> ${game.secretNumber} (1-${game.range})</p>
                <p><strong>Počet pokusů:</strong> ${game.attempts}</p>
                ${game.speedrunTime ? `<p><strong>Čas:</strong> ${game.speedrunTime.toFixed(2)}s</p>` : ''}
                <p><strong>Tvoje tipy:</strong></p>
                <div class="history-attempts">
                    ${game.attemptsList.map(num => `<span class="attempt-badge">${num}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Opravdu chceš vymazat celou historii her?')) {
        localStorage.removeItem('guessGameHistory');
        loadHistory();
    }
}

function setDifficulty(button) {
    document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    maxRange = parseInt(button.getAttribute('data-range'));
    updateMenuHighscore();
}

function updateMenuHighscore() {
    if (elements.speedrunCheckbox.checked) {
        elements.speedrunHighscore.classList.remove('hidden');
        loadHighscore(false);
    } else {
        elements.speedrunHighscore.classList.add('hidden');
    }
}

function setTheme(theme) {
    document.body.className = '';
    if (theme !== 'default') {
        document.body.classList.add('theme-' + theme);
    }

    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-theme') === theme) {
            opt.classList.add('active');
        }
    });

    localStorage.setItem('guessGameTheme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('guessGameTheme') || 'default';
    setTheme(savedTheme);
}

window.onload = function() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('tryAgainBtn').addEventListener('click', resetGame);
    elements.gameForm.addEventListener('submit', handleGuess);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() { setDifficulty(this); });
    });

    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.addEventListener('click', function() {
            setTheme(this.getAttribute('data-theme'));
        });
    });

    elements.guessInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    elements.speedrunCheckbox.addEventListener('change', updateMenuHighscore);

    loadTheme();
    loadHistory();
};