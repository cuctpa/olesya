document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 📊 НАСТРОЙКА ДАТЫ ЗНАКОМСТВА (Впиши сюда вашу дату)
    // ==========================================================================
    // Формат: Год, месяц (начиная с 0: январь=0, май=4), день, часы, минуты...
    const startDate = new Date(2025, 4, 15, 18, 0, 0); 

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
    const togetherTimerEl = document.getElementById('together-timer');
    const playerTrackTitle = document.getElementById('player-track-title');
    const openLetterBtn = document.getElementById('open-envelope-btn');
    const closeLetterBtn = document.getElementById('close-envelope-btn');
    const letterOverlay = document.getElementById('letter-overlay');

    let idleTimer;
    let beerLiters = 0;

    // Тайминги для бегущей строки песни АПФС — «Ма, я лаю» (в секундах)
    const lyricsTimings = [
        { time: 0, text: "Я залипаю в потолок..." },
        { time: 4, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 8, text: "Насыпаю, наливаю..." },
        { time: 12, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 16, text: "Насыпаю, наливаю..." },
        { time: 20, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 24, text: "Насыпаю, наливаю..." },
        { time: 28, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 32, text: "Насыпаю, наливаю..." },
        { time: 37, text: "Моё детство все болью наполнено" },
        { time: 40, text: "Я блевал на полу, не от пойла, но..." },
        { time: 44, text: "Ты по-прежнему бро мой, пойман я" },
        { time: 48, text: "Да, я полный придурок, да понял я" }
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

    function updateTogetherTimer() {
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        togetherTimerEl.textContent = `мы вместе: ${days}д ${hours}ч ${minutes}м ${seconds}с`;
    }
    setInterval(updateTogetherTimer, 1000);

    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            triggerGlitchFlash(80);
            card.classList.toggle('is-flipped');
            const blinkHint = card.querySelector('.hint-blink');
            if (blinkHint) blinkHint.style.display = 'none';
        });
    });

    // КЛИК ПО КРЫШКЕ
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
            updateTogetherTimer();
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

    function updateLyrics() {
        if (!idleScreen.classList.contains('active-idle')) return;
        if (!bgMusic.src.includes("music.mp3")) {
            lyricsLine.textContent = "Я залипаю в потолок...";
            return;
        }

        const currentTime = bgMusic.currentTime;
        let currentText = "Я залипаю в потолок...";

        for (let i = 0; i < lyricsTimings.length; i++) {
            if (currentTime >= lyricsTimings[i].time) { currentText = lyricsTimings[i].text; }
        }

        if (document.body.classList.contains('drunk-mode') && currentText.includes("Я блевал на полу")) {
            currentText = "Я блевал на полу, не от пойла, но... Ты по-прежнему бро мой. Я люблю тебя! 🖤";
        }

        if (lyricsLine.textContent !== currentText) {
            lyricsLine.style.opacity = '0';
            lyricsLine.style.transform = 'translateY(5px)';
            setTimeout(() => {
                lyricsLine.textContent = currentText;
                if (currentText.includes("Я блевал на полу")) {
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
