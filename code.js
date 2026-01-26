var secretNumber;
var attempts;
var attemptsList;
var maxRange = 100;
var gameActive = false;

function startGame() {
    secretNumber = Math.floor(Math.random() * maxRange) + 1;
    attempts = 0;
    attemptsList = [];
    gameActive = true;

    document.getElementById('startContainer').classList.add('hidden');
    document.getElementById('difficultySelector').classList.add('hidden');
    document.getElementById('gameForm').style.display = 'block';
    document.getElementById('gameInfo').classList.add('show');
    document.getElementById('rangeDisplay').textContent = '1-' + maxRange;
    document.getElementById('attemptsCount').textContent = '0';
    document.getElementById('attemptsContainer').classList.add('hidden');
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('guessInput').focus();
}

function handleGuess(e) {
    e.preventDefault();

    if (!gameActive) return;

    var guessInput = document.getElementById('guessInput');
    var guess = parseInt(guessInput.value);

    if (!guessInput.value || isNaN(guess)) {
        showError();
        return;
    }

    if (guess < 1 || guess > maxRange) {
        showError('Zadej cislo mezi 1 a ' + maxRange + '!');
        return;
    }

    attempts++;
    attemptsList.push(guess);
    updateAttempts();

    checkGuess(guess);

    guessInput.value = '';
    guessInput.classList.remove('error');
    document.getElementById('errorMessage').classList.remove('show');
}

function checkGuess(guess) {
    var difference = Math.abs(guess - secretNumber);
    var percentDiff = (difference / maxRange) * 100;

    if (guess === secretNumber) {
        gameWon();
    } else if (guess < secretNumber) {
        showFeedback('Moc nizko!', 'too-low', percentDiff);
    } else {
        showFeedback('Moc vysoko!', 'too-high', percentDiff);
    }
}

function showFeedback(message, type, percentDiff) {
    var hintMessage = '';
    var feedback = document.getElementById('feedback');
    
    if (percentDiff <= 5) {
        hintMessage = ' Hori!';
        feedback.className = 'feedback show hot';
    } else if (percentDiff <= 15) {
        hintMessage = 'Prihoriva!';
        feedback.className = 'feedback show warm';
    } else if (percentDiff <= 30) {
        hintMessage = 'Chladno...';
        feedback.className = 'feedback show cold';
    } else {
        hintMessage = 'Námraza! Zkus to znovu!';
        feedback.className = 'feedback show ' + type;
    }

    feedback.textContent = message + hintMessage;
    feedback.classList.add('show');
}

function gameWon() {
    gameActive = false;
    var feedback = document.getElementById('feedback');
    feedback.className = 'feedback show correct';
    feedback.textContent = 'Gratuluji! Uhodl jsi cislo ' + secretNumber + ' na ' + attempts + ' ' + getAttemptText(attempts) + '!';
    
    document.getElementById('gameForm').style.display = 'none';
    document.getElementById('tryAgainContainer').classList.remove('hidden');

    saveToHistory();
}

function getAttemptText(count) {
    if (count === 1) return 'pokus';
    if (count >= 2 && count <= 4) return 'pokusy';
    return 'pokusu';
}

function updateAttempts() {
    document.getElementById('attemptsCount').textContent = attempts;
    document.getElementById('attemptsContainer').classList.remove('hidden');
    
    var list = document.getElementById('attemptsList');
    list.innerHTML = '';
    
    for (var i = 0; i < attemptsList.length; i++) {
        var badge = document.createElement('span');
        badge.className = 'attempt-badge';
        badge.textContent = attemptsList[i];
        list.appendChild(badge);
    }
}

function showError(message) {
    if (!message) message = 'Prosim, zadej platne cislo!';
    
    var input = document.getElementById('guessInput');
    var errorMsg = document.getElementById('errorMessage');
    
    input.classList.add('error');
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

function resetGame() {
    document.getElementById('tryAgainContainer').classList.add('hidden');
    document.getElementById('attemptsContainer').classList.add('hidden');
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('gameInfo').classList.remove('show');
    document.getElementById('difficultySelector').classList.remove('hidden');
    document.getElementById('startContainer').classList.remove('hidden');
    document.getElementById('guessInput').value = '';
}

function saveToHistory() {
    var history = getHistory();
    var gameData = {
        date: new Date().toLocaleString('cs-CZ'),
        attempts: attempts,
        secretNumber: secretNumber,
        attemptsList: attemptsList.slice(),
        range: maxRange
    };
    
    history.unshift(gameData);
    
    if (history.length > 10) {
        history.pop();
    }
    
    localStorage.setItem('guessGameHistory', JSON.stringify(history));
    loadHistory();
}

function getHistory() {
    var stored = localStorage.getItem('guessGameHistory');
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

function loadHistory() {
    var history = getHistory();
    var historyList = document.getElementById('historyList');
    var clearBtn = document.getElementById('clearHistoryBtn');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999;">Zatim zadne dokoncene hry...</p>';
        clearBtn.classList.add('hidden');
        return;
    }

    clearBtn.classList.remove('hidden');
    historyList.innerHTML = '';
    
    for (var i = 0; i < history.length; i++) {
        var game = history[i];
        var item = document.createElement('div');
        item.className = 'history-item';
        
        var attemptsHtml = '';
        for (var j = 0; j < game.attemptsList.length; j++) {
            attemptsHtml += '<span class="attempt-badge">' + game.attemptsList[j] + '</span>';
        }
        
        item.innerHTML = '<div class="history-header">' +
            '<span>Hra #' + (history.length - i) + '</span>' +
            '<span>' + game.date + '</span>' +
            '</div>' +
            '<div class="history-details">' +
            '<p><strong>Tajne cislo:</strong> ' + game.secretNumber + ' (1-' + game.range + ')</p>' +
            '<p><strong>Pocet pokusu:</strong> ' + game.attempts + '</p>' +
            '<p><strong>Tvoje tipy:</strong></p>' +
            '<div class="history-attempts">' + attemptsHtml + '</div>' +
            '</div>';
        
        historyList.appendChild(item);
    }
}

function clearHistory() {
    if (confirm('Opravdu chces vymazat celou historii her?')) {
        localStorage.removeItem('guessGameHistory');
        loadHistory();
    }
}

window.onload = function() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('tryAgainBtn').addEventListener('click', resetGame);
    document.getElementById('gameForm').addEventListener('submit', handleGuess);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

    var difficultyBtns = document.querySelectorAll('.difficulty-btn');
    for (var i = 0; i < difficultyBtns.length; i++) {
        difficultyBtns[i].addEventListener('click', function() {
            for (var j = 0; j < difficultyBtns.length; j++) {
                difficultyBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            maxRange = parseInt(this.getAttribute('data-range'));
        });
    }

    document.getElementById('guessInput').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    loadHistory();
};