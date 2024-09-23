const numberDisplay = document.getElementById('numberDisplay');
const optionsContainer = document.getElementById('optionsContainer');
const scoreDisplay = document.getElementById('score');
const submitButton = document.getElementById('submit');
const nextRoundButton = document.getElementById('nextRound');
const celebration = document.getElementById('celebration');
const playAgainButton = document.getElementById('playAgain');
const timerDisplay = document.getElementById('timer');
const soldier = document.getElementById('soldier');
const enemySoldier = document.getElementById('enemySoldier');
const deadKnight = document.getElementById('deadKnight');
const scoreGauge = document.getElementById('scoreGauge');
const speakerIcon = document.getElementById('speakerIcon');
const backgroundMusic = document.getElementById('backgroundMusic');
const walkSound = document.getElementById('walkSound');
const victorySound = document.getElementById('victorySound');
const defeatSound = document.getElementById('defeatSound');
const magicAttackSound = document.getElementById('magicAttackSound');
const noTimeSound = document.getElementById('noTimeSound');
const levelSelector = document.getElementById('levelSelector');
const castle = document.getElementById('castle');
const number1Display = document.getElementById('number1Display');
const number2Display = document.getElementById('number2Display');
const andText = document.getElementById('andText');
const modeSelector = document.getElementById('modeSelector');

let gameMode = 'single'; // Default game mode
let currentNumbers; // For storing the numbers in the current round

const initialScore = 10; // Configurable initial score
const targetScore = 50; // Configurable target score

let currentNumber;
let currentOptions;
let score = initialScore; // Start the score at initialScore points
let timeLeft = 60; // 1 minute in seconds
let minNumber = 20; // Starting minimum number for difficulty
let maxNumber = 30; // Starting maximum number for difficulty
let maxMaxNumber = 150; // Default maxMaxNumber for medium level

let timerInterval; // Variable to store the timer interval

// Function to update maxMaxNumber and minNumber based on selected level
function updateLevel() {
    const selectedLevel = levelSelector.value;
    if (selectedLevel === 'easy') {
        minNumber = 4;
        maxMaxNumber = 100;
    } else if (selectedLevel === 'medium') {
        minNumber = 20;
        maxMaxNumber = 150;
    } else if (selectedLevel === 'hard') {
        minNumber = 30;
        maxMaxNumber = 200;
    }
    // Reset game when level changes
    resetGame();
}

// Event listener for level selector
levelSelector.addEventListener('change', updateLevel);

// Event listener for mode selector
modeSelector.addEventListener('change', () => {
    gameMode = modeSelector.value;
    resetGame();
});

// Play music automatically when the game starts
backgroundMusic.play().catch(error => {
    // Handle autoplay restrictions
    console.log('Autoplay was prevented. User interaction is required to start audio.');
    isMusicPlaying = false;
    speakerIcon.textContent = '🔇';
});

let isMusicPlaying = true;

speakerIcon.addEventListener('click', () => {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        speakerIcon.textContent = '🔇';
    } else {
        backgroundMusic.play();
        speakerIcon.textContent = '🔊';
    }
    isMusicPlaying = !isMusicPlaying;
});

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i <= Math.sqrt(num); i += 6) {
        if (num % i === 0 || num % (i + 2) === 0)
            return false;
    }
    return true;
}

function generateNumber() {
    if (gameMode === 'single') {
        let num;
        do {
            num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        } while (isPrime(num));
        return [num]; // Return an array for consistency
    } else if (gameMode === 'common') {
        let num1, num2;
        do {
            num1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
            num2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        } while (isPrime(num1) || isPrime(num2) || num1 === num2);
        return [num1, num2];
    }
}

function generateOptions(numbers) {
    const [number1, number2] = numbers;
    const options = [];
    let correctDivisors = [];
    const wrongOptions = [];
    const maxAttempts = 200; // Increased attempts for more complex calculations
    let attempts = 0;

    if (gameMode === 'single') {
        // Existing single mode code (unchanged)
        const number = number1;
        // Generate correct divisors less than the number
        for (let i = 2; i < number; i++) {
            if (number % i === 0) {
                correctDivisors.push(i);
            }
        }
        const maxOptionValue = number - 1; // All options must be less than the number
        const minOptionValue = 2;

        // Calculate the total possible unique wrong options
        const totalPossibleWrongOptions = maxOptionValue - minOptionValue + 1 - correctDivisors.length;
        const totalOptionsNeeded = Math.min(12, totalPossibleWrongOptions + correctDivisors.length);
        const wrongAnswersNeeded = totalOptionsNeeded - correctDivisors.length;

        // Generate wrong answers less than the number
        while (wrongOptions.length < wrongAnswersNeeded && attempts < maxAttempts) {
            const randomNum = Math.floor(Math.random() * (maxOptionValue - minOptionValue + 1)) + minOptionValue;
            if (
                !correctDivisors.includes(randomNum) &&
                !wrongOptions.includes(randomNum) &&
                number % randomNum !== 0
            ) {
                wrongOptions.push(randomNum);
            }
            attempts++;
        }
    } else if (gameMode === 'common') {
        // Generate common divisors of number1 and number2
        const maxDivisor = Math.min(number1, number2);
        for (let i = 2; i <= maxDivisor; i++) {
            if (number1 % i === 0 && number2 % i === 0) {
                correctDivisors.push(i);
            }
        }

        // Calculate the range for possible wrong answers
        const maxOptionValue = maxDivisor - 1; // All options must be less than the smallest number
        const minOptionValue = 2;

        // Calculate the total possible unique wrong options
        const totalPossibleWrongOptions = maxOptionValue - minOptionValue + 1 - correctDivisors.length;
        const totalOptionsNeeded = Math.min(12, totalPossibleWrongOptions + correctDivisors.length);
        const wrongAnswersNeeded = totalOptionsNeeded - correctDivisors.length;

        // Generate wrong answers less than both numbers
        while (wrongOptions.length < wrongAnswersNeeded && attempts < maxAttempts) {
            const randomNum = Math.floor(Math.random() * (maxOptionValue - minOptionValue + 1)) + minOptionValue;
            if (
                !correctDivisors.includes(randomNum) &&
                !wrongOptions.includes(randomNum) &&
                (number1 % randomNum !== 0 || number2 % randomNum !== 0)
            ) {
                wrongOptions.push(randomNum);
            }
            attempts++;
        }
    }

    options.push(...correctDivisors, ...wrongOptions);
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    return options;
}


function renderOptions(options) {
    optionsContainer.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
        });
        optionsContainer.appendChild(button);
    });
}

function checkAnswer() {
    // Pause the timer while showing results
    clearInterval(timerInterval);

    const selectedOptions = Array.from(document.querySelectorAll('.option.selected'));
    let correctDivisors = [];
    const [number1, number2] = currentNumbers;

    if (gameMode === 'single') {
        correctDivisors = currentOptions.filter(num => number1 % num === 0);
    } else if (gameMode === 'common') {
        correctDivisors = currentOptions.filter(num => number1 % num === 0 && number2 % num === 0);
    }

    let points = 0;
    let correctAnswers = 0;

    selectedOptions.forEach(option => {
        const value = parseInt(option.textContent);
        if (correctDivisors.includes(value)) {
            option.classList.add('correct');
            points++;
            correctAnswers++;
        } else {
            option.classList.add('incorrect');
            points -= 2; // Wrong answers remove 2 points
        }
        option.classList.remove('selected');
    });

    correctDivisors.forEach(divisor => {
        const option = Array.from(document.querySelectorAll('.option')).find(el => parseInt(el.textContent) === divisor);
        if (option && !option.classList.contains('correct')) {
            option.classList.add('missing');
            points--; // Missing answers remove 1 point
        }
    });

    let previousScore = score;
    score += points;
    score = Math.max(0, score); // Ensure score doesn't go below 0
    updateScore(previousScore, score);

    submitButton.style.display = 'none';
    nextRoundButton.style.display = 'inline-block';

    if (score >= targetScore) {
        setTimeout(() => {
            soldier.style.display = 'none';
            victorySound.play();
            celebration.querySelector('h2').textContent = 'Congratulations!';
            celebration.querySelector('p').textContent = `You've reached the target score!`;
            celebration.style.display = 'flex';
            throwParty();
            clearInterval(timerInterval); // Stop the timer
        }, 1000);
    } else if (score <= 0) {
        endGame('score');
    }

    // Increase difficulty by increasing maxNumber
    if (maxNumber < maxMaxNumber) {
        maxNumber += 20;
    }
}

function updateScore(previousScore, newScore) {
    scoreDisplay.textContent = newScore;
    const gaugeWidth = scoreGauge.clientWidth - soldier.clientWidth - 120; // Adjusted for padding and castle width
    const positionPercentage = Math.max(0, newScore / targetScore);
    const newLeft = gaugeWidth * positionPercentage;

    // Move the soldier to the new position
    setTimeout(() => {
        soldier.style.left = `${newLeft}px`;
    }, 1000);

    // If score decreased, show enemy soldier attacking from the castle
    if (newScore < previousScore) {
        // Get the positions relative to the score gauge
        const gaugeRect = scoreGauge.getBoundingClientRect();
        const castleRect = castle.getBoundingClientRect();
        const soldierRect = soldier.getBoundingClientRect();

        // Calculate the starting position (castle) and ending position (knight) for the enemy soldier
        const enemyStartLeft = castleRect.left - gaugeRect.left;
        const enemyEndLeft = soldierRect.left - gaugeRect.left + soldier.clientWidth;

        // Set the enemy soldier's starting position at the castle
        enemySoldier.style.left = `${enemyStartLeft}px`;
        enemySoldier.style.display = 'block';

        // Force reflow to ensure the starting position is applied before the transition
        enemySoldier.getBoundingClientRect();

        // Animate the enemy soldier moving towards the knight
        setTimeout(() => {
            enemySoldier.style.left = `${enemyEndLeft}px`;
            magicAttackSound.play();
        }, 100); // Small delay to ensure enemy appears before moving

        // Hide the enemy soldier after the animation
        setTimeout(() => {
            enemySoldier.style.display = 'none';
        }, 2000); // Duration should match the transition time
    }

    if (newScore > previousScore) {
        // Add 10 extra seconds for each correct answer
        timeLeft += 10;
        refreshTimerDisplay(); // Update timer display immediately
        walkSound.play();
    }
}

function startNewRound() {
    currentNumbers = generateNumber();
    currentOptions = generateOptions(currentNumbers);

    if (gameMode === 'single') {
        number1Display.textContent = currentNumbers[0];
        number2Display.style.display = 'none';
        andText.style.display = 'none';
    } else if (gameMode === 'common') {
        number1Display.textContent = currentNumbers[0];
        number2Display.textContent = currentNumbers[1];
        number2Display.style.display = 'inline';
        andText.style.display = 'inline';
    }

    renderOptions(currentOptions);
    submitButton.style.display = 'inline-block';
    nextRoundButton.style.display = 'none';

    // Resume the timer
    startTimer();
}

function throwParty() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function refreshTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.firstChild.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Change timer color to red when less than 10 seconds
    if (timeLeft <= 10) {
        if (!noTimeSoundPlayed) {
            noTimeSound.play();
            noTimeSoundPlayed = true;
        }
        timerDisplay.style.color = 'red';
    } else {
        timerDisplay.style.color = 'black';
        noTimeSoundPlayed = false; // Reset the flag if time increases
    }
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame('time');
    } else {
        timeLeft--;
        refreshTimerDisplay();
    }
}

function startTimer() {
    // Clear any existing timer
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

let noTimeSoundPlayed = false;

function endGame(reason) {
    clearInterval(timerInterval); // Stop the timer
    if (reason === 'time') {
        // You died
        deadKnight.style.display = 'block';
        deadKnight.style.left = soldier.style.left;
        defeatSound.play();

        // Hide the knight to simulate defeat
        soldier.style.display = 'none';

        celebration.style.display = 'flex';
        celebration.querySelector('h2').textContent = "Time's Up!";
        celebration.querySelector('p').textContent = `Your final score is ${score} points.`;
    } else if (reason === 'score') {
        // You died
        deadKnight.style.display = 'block';
        deadKnight.style.left = '0px';

        // Hide the knight to simulate defeat
        soldier.style.display = 'none';

        defeatSound.play();

        // Show Game Over after a delay
        setTimeout(() => {
            celebration.style.display = 'flex';
            celebration.querySelector('h2').textContent = 'Game Over!';
            celebration.querySelector('p').textContent = `You died!`;
        }, 2000);
    }
}

submitButton.addEventListener('click', checkAnswer);
nextRoundButton.addEventListener('click', startNewRound);
playAgainButton.addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    clearInterval(timerInterval); // Clear any existing timer
    score = initialScore; // Reset score to initialScore
    timeLeft = 60; // Reset time
    maxNumber = minNumber + 10; // Reset maxNumber based on minNumber
    scoreDisplay.textContent = score;
    soldier.style.left = '0px';
    timerDisplay.style.color = 'black';
    celebration.style.display = 'none';
    deadKnight.style.display = 'none';
    soldier.style.display = 'block'; // Show knight again
    placeSoldierAtStart();
    startNewRound();
    startTimer(); // Restart the timer
}

// Set initial score display
scoreDisplay.textContent = score;

// Place soldier according to initial score
function placeSoldierAtStart() {
    const gaugeWidth = scoreGauge.clientWidth - soldier.clientWidth - 120; // Adjusted for padding and castle width
    const positionPercentage = Math.max(0, score / targetScore);
    const initialLeft = gaugeWidth * positionPercentage;
    soldier.style.left = `${initialLeft}px`;
}

placeSoldierAtStart();
startNewRound();
startTimer(); // Start the timer when the game loads
