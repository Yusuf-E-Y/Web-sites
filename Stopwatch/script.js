let minutes = 0;
let seconds = 0;
let hours = 0;
let interval = null; // Kronometreyi durdurmak için

function updateDisplay() {
    // Eğer 0.0 formatında göstermek istersen:
    let displaySeconds = seconds < 10 ? '0' + seconds : seconds;
    let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    let displayHours = hours < 10 ? '0' + hours : hours;
    
    document.getElementById("display").innerText = `${displayHours}:${displayMinutes}:${displaySeconds}`;
}

function startTimer() {
    if (interval) return; // Eğer zaten çalışıyorsa tekrar başlatma
    interval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60){
            minutes = 0;
            hours++
        }

        updateDisplay(); // Ekranı güncelle
    }, 1000); // Her 1 saniye
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
