document.addEventListener('DOMContentLoaded', () => {

    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');
    const capBtn = document.getElementById('cap-btn');
    const tvNoise = document.querySelector('.tv-noise');
    const bgMusic = document.getElementById('bg-music');
    const beerSound = document.getElementById('beer-sound');
    const playerToggle = document.getElementById('player-toggle');
    const wheels = document.querySelectorAll('.tape-wheel');
    const pourBeerBtn = document.getElementById('pour-beer-btn');
    const beerCountEl = document.getElementById('beer-count');
    const goalText = document.getElementById('goal-text');
    const idleScreen = document.getElementById('idle-screen');
    const lyricsLine = document.getElementById('lyrics-line');
    const rainContainer = document.getElementById('heart-rain-container');
    const playerTrackTitle = document.getElementById('player-track-title');
    const openLetterBtn = document.getElementById('open-envelope-btn');
    const closeLetterBtn = document.getElementById('close-envelope-btn');
    const letterOverlay = document.getElementById('letter-overlay');

    // Элементы Колеса Фортуны
    const capWheel = document.getElementById('cap-wheel');
    const spinWheelBtn = document.getElementById('spin-wheel-btn');
    const wheelResultText = document.getElementById('wheel-result-text');

    let idleTimer;
    let beerLiters = 0;
    let isSpinning = false;
    // Текстовая база бегущих строк под каждый трек АПФС
    const lyricsMaYaLayu = [
        { time: 0, text: "Я залипаю в потолок..." },
        { time: 4, text: "Малая, будь со мной, я все понимаю" },
        { time: 8, text: "Насыпаю, наливаю..." },
        { time: 12, text: "Малая, будь со мной, я все понимаю" },
        { time: 16, text: "Насыпаю, наливаю..." },
        { time: 20, text: "Малая, будь со мной, я все понимаю" },
        { time: 24, text: "Насыпаю, наливаю..." },
        { time: 28, text: "Малая, будь со мной, я все понимаю" },
        { time: 32, text: "Насыпаю, наливаю..." },
        { time: 37, text: "Моё детство воспоминаниями наполнено" },
        { time: 40, text: "Я искал свой путь, и теперь всё пройдено" },
        { time: 44, text: "Ты по-прежнему бро мой, пойман я" },
        { time: 48, text: "Да, я странный немного, да понял я" },
        { time: 52, text: "Я залипаю в потолок..." }
    ];

    const lyricsEy = [
        { time: 0, text: "Слушаешь трек «Эй»..." },
        { time: 4, text: "Эй, малая, ты меня слышишь?.." },
        { time: 8, text: "Подойди ко мне поближе" },
        { time: 12, text: "Посмотри в мои глаза" },
        { time: 15, text: "Я ценю тебя, ты моя натура" },
        { time: 19, text: "И у тебя такая figura..." },
        { time: 24, text: "И пускай все катится к чертям" },
        { time: 28, text: "Я залипаю в потолок..." }
    ];

    const lyricsGryaznyKayf = [
        { time: 0, text: "Слушаешь трек «Грязный кайф»..." },
        { time: 5, text: "Это странный кайф, малая..." },
        { time: 10, text: "Ты мой самый лучший этот кайф" },
        { time: 15, text: "С тобой в этой темной комнате" },
        { time: 20, text: "Мы ловим наш бесконечный вайб" },
        { time: 25, text: "И пускай весь мир подождет" },
        { time: 30, text: "Я залипаю в потолок..." }
    ];

    bgMusic.src = "music.mp3";
    function triggerGlitchFlash(duration = 200) {
        tvNoise.classList.add('glitch-flash');
        setTimeout(() => { tvNoise.classList.remove('glitch-flash'); }, duration);
    }

    function createFallingHeart() {
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        const heartTypes = ['🖤', '💔', '❤️'];
        heart.textContent = heartTypes[Math.floor(Math.random() * heartTypes.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 12 + 14;
        heart.style.fontSize = size + 'px';
        heart.style.animationDuration = Math.random() * 2.0 + 2.0 + 's';
        rainContainer.appendChild(heart);
        setTimeout(() => { heart.remove(); }, 4000);
    }

    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            triggerGlitchFlash(80);
            card.classList.toggle('is-flipped');
            const blinkHint = card.querySelector('.hint-blink');
            if (blinkHint) blinkHint.style.display = 'none';
        });
    });

    capBtn.addEventListener('click', () => {
        triggerGlitchFlash(400);
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            wheels.forEach(w => w.classList.remove('paused'));
            try {
                beerSound.play().catch(() => {});
                bgMusic.volume = 0.15;
                bgMusic.play().catch(() => {});
            } catch(e) {}
            resetIdleTimer();
            checkWheelStatus(); // Проверяем колесо при входе
        }, 600);
    });
    playerToggle.addEventListener('click', () => {
        triggerGlitchFlash(120);
        if (bgMusic.paused) {
            bgMusic.play().catch(() => {});
            wheels.forEach(w => w.classList.remove('paused'));
        } else {
            bgMusic.pause();
            wheels.forEach(w => w.classList.add('paused'));
        }
    });

    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerGlitchFlash(150);
            trackItems.forEach(t => t.classList.remove('active'));
            item.classList.add('active');

            bgMusic.src = item.getAttribute('data-src');
            playerTrackTitle.textContent = item.textContent.replace(/^\d+\.\s*/, '') + " (A-Side)";
            bgMusic.volume = 0.15;
            bgMusic.play().catch(() => {});
            wheels.forEach(w => w.classList.remove('paused'));
        });
    });

    openLetterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerGlitchFlash(200);
        letterOverlay.classList.add('visible-fade');
    });

    closeLetterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        letterOverlay.classList.remove('visible-fade');
    });
    pourBeerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        beerLiters += 0.5;
        beerCountEl.textContent = beerLiters.toFixed(1);
        triggerGlitchFlash(150);
        
        for(let i=0; i<4; i++) {
            setTimeout(createFallingHeart, i * 150);
        }

        if (beerLiters >= 5.0) {
            document.body.classList.add('drunk-mode');
            goalText.textContent = "цель выполнена: секрет открыт ✔";
            goalText.classList.add('goal-reached');
        } else {
            let left = (5.0 - beerLiters).toFixed(1);
            goalText.textContent = `цель: 5.0 л (осталось ${left} л)`;
        }

        if (navigator.vibrate) navigator.vibrate(30);
        beerCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => { beerCountEl.style.transform = 'scale(1)'; }, 120);
    });

    // Функция проверки статуса колеса (можно ли сегодня крутить)
    function checkWheelStatus() {
        const lastSpin = localStorage.getItem('lastFlowerSpinDate');
        const today = new Date().toDateString();

        if (lastSpin === today) {
            spinWheelBtn.disabled = true;
            wheelResultText.textContent = "Попытка использована. Возвращайся завтра! 🌸";
            wheelResultText.style.color = "#666";
        }
    }
    // Логика вращения Ежедневного Колеса Фортуны
    if (spinWheelBtn) {
        spinWheelBtn.addEventListener('click', () => {
            if (isSpinning) return;
            
            isSpinning = true;
            spinWheelBtn.disabled = true;
            triggerGlitchFlash(150);
            wheelResultText.textContent = "Крышка бешено вращается...";
            wheelResultText.style.color = "#FFBF00";

            // Генерируем случайное число оборотов + угол фиксации сектора
            // 0 - Букет (Вверху), 90 - Ничего (Справа), 180 - Роза (Внизу), 270 - Ничего (Слева)
            const randomDegrees = Math.floor(Math.random() * 4) * 90; 
            const totalRotation = 1800 + randomDegrees; // 5 полных кругов + сектор

            capWheel.style.transform = `rotate(${totalRotation}deg)`;

            setTimeout(() => {
                isSpinning = false;
                
                // Сохраняем сегодняшнюю дату, чтобы заблокировать игру до завтра
                const today = new Date().toDateString();
                localStorage.setItem('lastFlowerSpinDate', today);

                // Вычисляем, какой сектор оказался наверху стрелки (с учетом направления вращения)
                const finalAngle = randomDegrees % 360;

                if (finalAngle === 0) {
                    wheelResultText.textContent = "ВЫПАЛИ ЦВЕТЫ! 💐 С меня сочный букет! Сделай скрин и пришли мне!";
                    wheelResultText.style.color = "#00ff66";
                    for(let i=0; i<15; i++) setTimeout(createFallingHeart, i * 100);
                } else if (finalAngle === 180) {
                    wheelResultText.textContent = "ВЫПАЛА РОЗА! 🌹 Сегодня ты получаешь розу! Сделай скрин!";
                    wheelResultText.style.color = "#00ff66";
                    for(let i=0; i<8; i++) setTimeout(createFallingHeart, i * 100);
                } else {
                    wheelResultText.textContent = "Пусто... К сожалению, сегодня цветы не выпали. Попробуй завтра! 💔";
                    wheelResultText.style.color = "#ff2a2a";
                }
            }, 4000); // 4 секунды кручения под cubic-bezier
        });
    }
    // Функция караоке: подтягивает текст по имени текущего аудиофайла в src
    function updateLyrics() {
        if (!idleScreen.classList.contains('active-idle')) return;

        const currentTrackFile = bgMusic.src.split('/').pop().toLowerCase();
        let trackLyrics = lyricsMaYaLayu;

        if (currentTrackFile.includes('track2')) {
            trackLyrics = lyricsEy;
        } else if (currentTrackFile.includes('track3')) {
            trackLyrics = lyricsGryaznyKayf;
        }

        const currentTime = bgMusic.currentTime;
        let currentText = "Я залипаю в потолок...";

        for (let i = 0; i < trackLyrics.length; i++) {
            if (currentTime >= trackLyrics[i].time) {
                currentText = trackLyrics[i].text;
            }
        }

        if (document.body.classList.contains('drunk-mode') && currentTrackFile.includes('music') && currentText.includes("Моё детство")) {
            currentText = "Моё детство воспоминаниями наполнено... Ты по-прежнему бро мой. Я люблю тебя! 🖤";
        }

        if (lyricsLine.textContent !== currentText) {
            lyricsLine.style.opacity = '0';
            lyricsLine.style.transform = 'translateY(5px)';
            setTimeout(() => {
                lyricsLine.textContent = currentText;
                
                if (currentText.includes("Моё детство") || currentText.includes("Я люблю тебя")) {
                    lyricsLine.classList.add('highlight-lyrics');
                } else {
                    lyricsLine.classList.remove('highlight-lyrics');
                }

                lyricsLine.style.opacity = '1';
                lyricsLine.style.transform = 'translateY(0)';
            }, 250);
        }
    }

    bgMusic.addEventListener('timeupdate', updateLyrics);

    function resetIdleTimer() {
        if (idleScreen.classList.contains('active-idle')) {
            bgMusic.volume = 0.15;
            idleScreen.classList.remove('active-idle');
            triggerGlitchFlash(200);
        }
        clearTimeout(idleTimer);
        if (!introScreen.classList.contains('hidden')) return;
        idleTimer = setTimeout(activateIdleMode, 12000);
    }

    function activateIdleMode() {
        if (letterOverlay.classList.contains('visible-fade')) return;
        idleScreen.classList.add('active-idle');
        bgMusic.volume = 0.03;
        updateLyrics();
    }

    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('wheel', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer, { passive: true });

});
