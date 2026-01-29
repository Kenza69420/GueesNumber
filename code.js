let secretNumber, attempts, attemptsList, maxRange = 100, gameActive = false;
let lastGuess = null, lastWasTooLow = false, wrongDirectionCount = 0;

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
    clearHistoryBtn: document.getElementById('clearHistoryBtn')
};

function startGame() {
    secretNumber = Math.floor(Math.random() * maxRange) + 1;
    attempts = 0;
    attemptsList = [];
    gameActive = true;
    lastGuess = null;
    lastWasTooLow = false;
    wrongDirectionCount = 0;

    toggleVisibility([elements.startContainer, elements.difficultySelector], false);
    toggleVisibility([elements.gameForm, elements.gameInfo], true);
    elements.rangeDisplay.textContent = `1-${maxRange}`;
    elements.attemptsCount.textContent = '0';
    elements.attemptsContainer.classList.add('hidden');
    elements.feedback.classList.remove('show');
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

function gameWon() {
    gameActive = false;
    const attemptText = attempts === 1 ? 'pokus' : (attempts <= 4 ? 'pokusy' : 'pokusů');
    showFeedback(`Gratuluji! Uhodl jsi číslo ${secretNumber} na ${attempts} ${attemptText}!`, 'correct');
    
    elements.gameForm.style.display = 'none';
    elements.tryAgainContainer.classList.remove('hidden');
    saveToHistory();
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
    toggleVisibility([elements.tryAgainContainer, elements.attemptsContainer, elements.gameInfo], false);
    toggleVisibility([elements.difficultySelector, elements.startContainer], true);
    elements.feedback.classList.remove('show');
    elements.guessInput.value = '';
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

function saveToHistory() {
    const history = getHistory();
    history.unshift({
        date: new Date().toLocaleString('cs-CZ'),
        attempts,
        secretNumber,
        attemptsList: [...attemptsList],
        range: maxRange
    });

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
        <div class="history-item">
            <div class="history-header">
                <span>Hra #${history.length - index}</span>
                <span>${game.date}</span>
            </div>
            <div class="history-details">
                <p><strong>Tajné číslo:</strong> ${game.secretNumber} (1-${game.range})</p>
                <p><strong>Počet pokusů:</strong> ${game.attempts}</p>
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

    loadTheme();
    loadHistory();
};