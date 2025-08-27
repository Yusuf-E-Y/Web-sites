let minutes = 0;
let seconds = 0;
let hours = 0;
let interval = null; // Empty values

function updateDisplay() {
    // show the clock 
    let displaySeconds = seconds < 10 ? '0' + seconds : seconds;
    let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    let displayHours = hours < 10 ? '0' + hours : hours;
    
    document.getElementById("display").innerText = `${displayHours}:${displayMinutes}:${displaySeconds}`;
}

function startTimer() {
    if (interval) return; //if it is working, do not restart it
    interval = setInterval(() => {
        seconds++;
        if (seconds === 60) { //second settings
            seconds = 0;
            minutes++;
        }
        if (minutes === 60){ //minute settings
            minutes = 0;
            hours++
        }

        updateDisplay(); // Updtae screen
    }, 1000); // 1 seconds
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function resetTimer() {
    stopTimer();
    minutes = 0;
    seconds = 0;
    hours = 0;
    updateDisplay();
}

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("stop").addEventListener("click", stopTimer);
document.getElementById("reset").addEventListener("click", resetTimer);
