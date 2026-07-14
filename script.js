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
    const goalText = document.getElementById('goal-text'); // Текст цели
    const idleScreen = document.getElementById('idle-screen');
    const lyricsLine = document.getElementById('lyrics-line');
    const rainContainer = document.getElementById('heart-rain-container');

    let idleTimer;
    let beerLiters = 0;
    let audioCtx, source, lowpassFilter;

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
        // Куплет
        { time: 37, text: "Моё детство все болью наполнено" },
        { time: 40, text: "Я блевал на полу, не от пойла, но..." },
        { time: 44, text: "Ты по-прежнему бро мой, пойман я" },
        { time: 48, text: "Да, я полный придурок, да понял я" },
        { time: 51, text: "А давай будем мериться шрамами" },
        { time: 55, text: "По лицу бытовыми ударами?" },
        { time: 59, text: "Полицейские палят нас пьяными" },
        { time: 62, text: "Подскажи, сколько суток не спали мы?" },
        { time: 66, text: "Их харассит за то, что домой плывём" },
        { time: 70, text: "Поднимите мне вымпелы, я вылил яд" },
        { time: 73, text: "Я на даче, в гостях, organism иссяк" },
        { time: 77, text: "Подкури об меня, не кури взатяг" },
        { time: 81, text: "Их харассит за то, что мы плывём" },
        { time: 84, text: "Поднимите мне вымпелы, я вылил яд" },
        { time: 88, text: "Я на даче, в гостях, organism иссяк" },
        { time: 91, text: "Подкури об меня, не кури взатяг..." },
        // Припев повтор
        { time: 95, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 99, text: "Насыпаю, наливаю..." },
        { time: 103, text: "Малая, проглоти со мной, и я тебе полаю" },
        { time: 107, text: "Насыпаю, наливаю..." }
    ];

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

    // Логика 3D переворота + скрытие надписи [тапни]
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            triggerGlitchFlash(80);
            card.classList.toggle('is-flipped');
            
            // Находим и скрываем мигающую подсказку после первого же тапа на карту
            const blinkHint = card.querySelector('.hint-blink');
            if (blinkHint) {
                blinkHint.style.display = 'none';
            }
        });
    });

    capBtn.addEventListener('click', () => {
        try { beerSound.play().catch(() => {}); } catch(err) {}
        triggerGlitchFlash(400);
        introScreen.style.opacity = '0';
        
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            try {
                bgMusic.volume = 0.15;
                bgMusic.play().catch(() => {});
            } catch(err) {}
            wheels.forEach(w => w.classList.remove('paused'));
            initAudioFilters();
            resetIdleTimer();
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

    // Кнопка глотка
    pourBeerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        beerLiters += 0.5;
        beerCountEl.textContent = beerLiters.toFixed(1);
        triggerGlitchFlash(150);
        
        for(let i=0; i<4; i++) {
            setTimeout(createFallingHeart, i * 150);
        }

        // Логика подсказки цели: подсвечиваем зеленым на 5 литрах
        if (beerLiters >= 5.0) {
            document.body.classList.add('drunk-mode');
            goalText.textContent = "цель выполнена: секрет открыт ✔";
            goalText.classList.add('goal-reached');
        } else {
            // Динамическая подсказка сколько осталось до секрета
            let left = (5.0 - beerLiters).toFixed(1);
            goalText.textContent = `цель: 5.0 л (осталось ${left} л)`;
        }

        if (navigator.vibrate) navigator.vibrate(30);
        beerCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => { beerCountEl.style.transform = 'scale(1)'; }, 120);
    });

    function initAudioFilters() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            source = audioCtx.createMediaElementSource(bgMusic);
            lowpassFilter = audioCtx.createBiquadFilter();
            lowpassFilter.type = 'lowpass';
            lowpassFilter.frequency.setValueAtTime(20000, audioCtx.currentTime);
            source.connect(lowpassFilter);
            lowpassFilter.connect(audioCtx.destination);
        } catch(err) {}
    }

    function updateLyrics() {
        if (!idleScreen.classList.contains('active-idle')) return;

        const currentTime = bgMusic.currentTime;
        let currentText = "Я залипаю в потолок...";

        for (let i = 0; i < lyricsTimings.length; i++) {
            if (currentTime >= lyricsTimings[i].time) {
                currentText = lyricsTimings[i].text;
            }
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
            if (lowpassFilter && audioCtx && audioCtx.state !== 'suspended') {
                lowpassFilter.frequency.exponentialRampToValueAtTime(20000, audioCtx.currentTime + 0.4);
            }
            bgMusic.volume = 0.15;
            idleScreen.classList.remove('active-idle');
            triggerGlitchFlash(200);
        }

        clearTimeout(idleTimer);
        if (!introScreen.classList.contains('hidden')) return;
        idleTimer = setTimeout(activateIdleMode, 12000);
    }

    function activateIdleMode() {
        idleScreen.classList.add('active-idle');
        if (lowpassFilter && audioCtx && audioCtx.state !== 'suspended') {
            lowpassFilter.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 1.5);
        }
        bgMusic.volume = 0.04;
        updateLyrics();
    }

    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('wheel', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer, { passive: true });

});
