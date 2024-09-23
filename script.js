$(document).ready(function() {
    const $numberDisplay = $('#numberDisplay'),
        $number1Display = $('#number1Display'),
        $number2Display = $('#number2Display'),
        $andText = $('#andText'),
        $optionsContainer = $('#optionsContainer'),
        $scoreDisplay = $('#score'),
        $submitButton = $('#submit'),
        // Removed $nextRoundButton from UI
        $celebration = $('#celebration'),
        $playAgainButton = $('#playAgain'),
        $timerDisplay = $('#timer'),
        $soldier = $('#soldier'),
        $soldierIdle = 'jens-steenmetz-swordsman-idle.gif',
        $soldierRunning = 'jens-steenmetz-swordsman-running.gif',
        $enemySoldier = $('#enemySoldier'),
        $deadKnight = $('#deadKnight'),
        $scoreGauge = $('#scoreGauge'),
        $speakerIcon = $('#speakerIcon'),
        backgroundMusic = document.getElementById('backgroundMusic'),
        walkSound = document.getElementById('walkSound'),
        victorySound = document.getElementById('victorySound'),
        defeatSound = document.getElementById('defeatSound'),
        magicAttackSound = document.getElementById('magicAttackSound'),
        noTimeSound = document.getElementById('noTimeSound'),
        $levelSelector = $('#levelSelector'),
        $castle = $('#castle'),
        $modeSelector = $('#modeSelector'),
        $instructions = $('#instructions'),
        $feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'), {}),
        $feedbackMessage = $('#feedbackMessage'),
        $feedbackNextRound = $('#feedbackNextRound');

    let gameMode = 'single'; // Default game mode
    let currentNumbers; // For storing the numbers in the current round
    let currentOptions;
    const initialScore = 10; // Configurable initial score
    const targetScore = 50; // Configurable target score

    let score = initialScore; // Start the score at initialScore points
    let timeLeft = 60; // 1 minute in seconds
    let minNumber = 20; // Starting minimum number for difficulty
    let maxNumber = 30; // Starting maximum number for difficulty
    let maxMaxNumber = 150; // Default maxMaxNumber for medium level

    let timerInterval; // Variable to store the timer interval

    // Function to update maxMaxNumber and minNumber based on selected level
    const updateLevel = () => {
        const selectedLevel = $levelSelector.val();
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
    $levelSelector.on('change', updateLevel);

    // Event listener for mode selector
    $modeSelector.on('change', function() {
        gameMode = $(this).val();
        resetGame();
    });

    // Play music automatically when the game starts
    backgroundMusic.play().catch(error => {
        // Handle autoplay restrictions
        console.log('Autoplay was prevented. User interaction is required to start audio.');
        isMusicPlaying = false;
        $speakerIcon.text('🔇');
    });

    let isMusicPlaying = true;

    $speakerIcon.on('click', function() {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            $speakerIcon.text('🔇');
        } else {
            backgroundMusic.play();
            $speakerIcon.text('🔊');
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
            // Allow prime numbers by removing the isPrime check
            num = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
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
        $optionsContainer.empty();
        options.forEach(option => {
            const $button = $('<button>')
                .text(option)
                .addClass('option btn btn-light')
                .on('click', function() {
                    $(this).toggleClass('selected btn-light btn-success');
                });
            $optionsContainer.append($button);
        });
    }

    function checkAnswer() {
        // Pause the timer while showing results
        clearInterval(timerInterval);

        const $selectedOptions = $('.option.selected');
        let correctDivisors = [];
        const [number1, number2] = currentNumbers;

        if (gameMode === 'single') {
            correctDivisors = currentOptions.filter(num => number1 % num === 0);
        } else if (gameMode === 'common') {
            correctDivisors = currentOptions.filter(num => number1 % num === 0 && number2 % num === 0);
        }

        let points = 0;
        let correctAnswers = 0;

        const hasDivisors = correctDivisors.length > 0;

        // Store old score before updating
        const oldScore = score;

        if (!hasDivisors && $selectedOptions.length === 0) {
            // Correctly identified that there are no divisors
            points += 1;
            // Set feedback message
            $feedbackMessage.text("✅ Correct! You found all the divisors.");
            // Award 10 extra seconds
            timeLeft += 10;
            refreshTimerDisplay();
        } else if (!hasDivisors && $selectedOptions.length > 0) {
            // Incorrectly selected options when there are no divisors
            $selectedOptions.each(function() {
                $(this).addClass('incorrect');
                points -= 2; // Wrong answers remove 2 points
                $(this).removeClass('selected');
            });
            $feedbackMessage.text("❌ Incorrect! There are no divisors to select.");
        } else {
            // When there are divisors
            $selectedOptions.each(function() {
                const value = parseInt($(this).text());
                if (correctDivisors.includes(value)) {
                    $(this).addClass('correct');
                    points += 1;
                    correctAnswers++;
                } else {
                    $(this).addClass('incorrect');
                    points -= 2; // Wrong answers remove 2 points
                }
                $(this).removeClass('selected');
            });

            correctDivisors.forEach(divisor => {
                const $option = $('.option').filter(function() {
                    return parseInt($(this).text()) === divisor;
                });
                if ($option.length && !$option.hasClass('correct')) {
                    $option.addClass('missing');
                    points -= 1; // Missing answers remove 1 point
                }
            });

            if (correctAnswers === correctDivisors.length && $selectedOptions.length === correctDivisors.length) {
		$feedbackMessage.text("✅ Great job! You've found all the divisors.");
                // Award 10 extra seconds
                timeLeft += 10;
                refreshTimerDisplay();
            } else {
		$feedbackMessage.text("⚠️ Some answers were incorrect or missing.");
            }
        }

        // Update the score
        score += points;
        score = Math.max(0, score); // Ensure score doesn't go below 0
        updateScore(oldScore, score);

        // Show the feedback modal with the message
        $feedbackModal.show();

        if (score >= targetScore) {
            setTimeout(() => {
                $soldier.hide();
                victorySound.play();
                $celebration.find('h2').text('🎉 Congratulations!');
                $celebration.find('p').text(`You've reached the target score!`);
                $celebration.modal('show');
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

    function updateScore(oldScore, newScore) {
        $scoreDisplay.text(newScore);
        const gaugeWidth = $scoreGauge.width() - $soldier.width() - 120; // Adjusted for padding and castle width
        const positionPercentage = Math.max(0, newScore / targetScore);
        const newLeft = gaugeWidth * positionPercentage;

        // If score decreased, show enemy soldier attacking from the castle
        if (newScore < oldScore) {
            // Positions relative to the score gauge
            const gaugeOffset = $scoreGauge.offset();
            const castleOffset = $castle.offset();
            const soldierOffset = $soldier.offset();

            // Calculate the starting position (castle) and ending position (knight) for the enemy soldier
            const enemyStartLeft = castleOffset.left - gaugeOffset.left;
            const enemyEndLeft = soldierOffset.left - gaugeOffset.left + $soldier.width();

            // Set the enemy soldier's starting position at the castle
            $enemySoldier.css('left', `${enemyStartLeft}px`).show();

            // Force reflow to ensure the starting position is applied before the transition
            $enemySoldier[0].offsetWidth;

            // Animate the enemy soldier moving towards the knight
            $enemySoldier.css('left', `${enemyEndLeft}px`);
            magicAttackSound.play();

            // Hide the enemy soldier after the animation
            setTimeout(() => {
                $enemySoldier.hide();
            }, 2000); // Duration should match the transition time
        }

        // Move the soldier to the new position
        setTimeout(() => {
            $soldier.attr('src', $soldierRunning);
            $soldier.css('left', `${newLeft}px`);

            setTimeout(() => {
                 $soldier.attr('src', $soldierIdle);
            }, 1000);
        }, 1000);

        if (newScore > oldScore) {
            // Extra seconds already handled in checkAnswer
            // Just play the walk sound
            walkSound.play();
        }
    }

    function startNewRound() {
        currentNumbers = generateNumber();
        currentOptions = generateOptions(currentNumbers);

        if (gameMode === 'single') {
            $instructions.text('Select all divisors of the number. If there are none, submit without selecting any options.');
            $instructions.show();
            $number1Display.text(currentNumbers[0]);
            $number2Display.hide();
            $andText.hide();

            // Render options only if there are divisors
            if (currentOptions.length > 0) {
                renderOptions(currentOptions);
            } else {
                $optionsContainer.empty(); // Ensure no options are displayed
            }
        } else if (gameMode === 'common') {
            $instructions.text('Select all common divisors of the numbers. If there are none, submit without selecting any options.');
            $instructions.show();
            $number1Display.text(currentNumbers[0]);
            $number2Display.text(currentNumbers[1]).show();
            $andText.show();
            renderOptions(currentOptions);
        }

        $submitButton.show();

        // Resume the timer
        startTimer();
    }

    function throwParty() {
        for (let i = 0; i < 50; i++) {
            const $confetti = $('<div>')
                .addClass('confetti')
                .css({
                    left: `${Math.random() * 100}vw`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
                });
            $('body').append($confetti);

            setTimeout(() => {
                $confetti.remove();
            }, 5000);
        }
    }

    function refreshTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        $timerDisplay.text(`${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Change timer color to red when less than 10 seconds
        if (timeLeft <= 10) {
            if (!noTimeSoundPlayed) {
                noTimeSound.play();
                noTimeSoundPlayed = true;
            }
            $timerDisplay.css('color', 'red');
        } else {
            $timerDisplay.css('color', 'black');
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
            $deadKnight.css('left', $soldier.css('left')).show();
            defeatSound.play();

            // Hide the knight to simulate defeat
            $soldier.hide();

            $celebration.find('h2').text("⌛ Time's Up!");
            $celebration.find('p').text(`Your final score is ${score} points.`);
            $celebration.modal('show');
        } else if (reason === 'score') {
            // You died
            $deadKnight.show().css('left', '0px');

            // Hide the knight to simulate defeat
            $soldier.hide();

            defeatSound.play();

            // Show Game Over after a delay
            setTimeout(() => {
                $celebration.find('h2').text('Game Over!');
                $celebration.find('p').text(`You died!`);
                $celebration.modal('show');
            }, 2000);
        }
    }

    // Handle Submit Button Click
    $submitButton.on('click', checkAnswer);

    // Handle Next Round Button in Feedback Modal
    $feedbackNextRound.on('click', function() {
        $feedbackModal.hide();
        startNewRound();
    });

    // Handle Play Again Button in Celebration Modal
    $playAgainButton.on('click', function() {
        $celebration.modal('hide');
        resetGame();
    });

    function resetGame() {
        clearInterval(timerInterval); // Clear any existing timer
        score = initialScore; // Reset score to initialScore
        timeLeft = 60; // Reset time
        maxNumber = minNumber + 10; // Reset maxNumber based on minNumber
        $scoreDisplay.text(score);
        $soldier.css('left', '0px');
        $timerDisplay.css('color', 'black');
        $celebration.hide();
        $deadKnight.hide();
        $soldier.show(); // Show knight again
        placeSoldierAtStart();
        startNewRound();
        startTimer(); // Restart the timer
    }

    // Set initial score display
    $scoreDisplay.text(score);

    // Place soldier according to initial score
    function placeSoldierAtStart() {
        const gaugeWidth = $scoreGauge.width() - $soldier.width() - 120; // Adjusted for padding and castle width
        const positionPercentage = Math.max(0, score / targetScore);
        const initialLeft = gaugeWidth * positionPercentage;
        $soldier.css('left', `${initialLeft}px`);
    }

    placeSoldierAtStart();
    startNewRound();
    startTimer(); // Start the timer when the game loads
});

