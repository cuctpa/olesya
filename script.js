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
    const idleScreen = document.getElementById('idle-screen');

    let idleTimer;
    let beerLiters = 0;
    let audioCtx, source, lowpassFilter;

    function triggerGlitchFlash(duration = 200) {
        tvNoise.classList.add('glitch-flash');
        setTimeout(() => {
            tvNoise.classList.remove('glitch-flash');
        }, duration);
    }

    // Защищенный клик по крышке — Пропускает на сайт при любом раскладе
    capBtn.addEventListener('click', () => {
        try {
            beerSound.play().catch(e => console.log("Браузер отложил звук пива:", e));
        } catch(err) {
            console.log("Элемент аудио пива не поддерживается браузером:", err);
        }
        
        triggerGlitchFlash(400);
        introScreen.style.opacity = '0';
        
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            try {
                bgMusic.play().catch(e => console.log("Браузер отложил музыку:", e));
            } catch(err) {
                console.log("Элемент фоновой музыки не поддерживается браузером:", err);
            }

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

    pourBeerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        beerLiters += 0.5;
        beerCountEl.textContent = beerLiters.toFixed(1);
        triggerGlitchFlash(150);

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
        } catch(err) {
            console.log("Web Audio контекст ограничен браузером", err);
        }
    }

    function resetIdleTimer() {
        if (idleScreen.classList.contains('active-idle')) {
            if (lowpassFilter && audioCtx && audioCtx.state !== 'suspended') {
                lowpassFilter.frequency.exponentialRampToValueAtTime(20000, audioCtx.currentTime + 0.4);
            }
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
    }

    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('wheel', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer, { passive: true });

});
