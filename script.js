document.addEventListener('DOMContentLoaded', () => {

    // Поиск элементов интерфейса
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

    // Переменные звукового фильтра (Web Audio API)
    let audioCtx, source, lowpassFilter;

    // Вспышка телевизионных помех
    function triggerGlitchFlash(duration = 200) {
        tvNoise.classList.add('glitch-flash');
        setTimeout(() => {
            tvNoise.classList.remove('glitch-flash');
        }, duration);
    }

    // Клик/Тап по крышке — Старт сайта
    capBtn.addEventListener('click', () => {
        beerSound.play().catch(e => console.log("Браузер заблокировал автоплей:", e));
        triggerGlitchFlash(400);

        introScreen.style.opacity = '0';
        
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            bgMusic.play();
            wheels.forEach(w => w.classList.remove('paused'));

            initAudioFilters();
            resetIdleTimer();
        }, 600);
    });

    // Управление плеером (Пауза/Плей)
    playerToggle.addEventListener('click', () => {
        triggerGlitchFlash(120);

        if (bgMusic.paused) {
            bgMusic.play();
            wheels.forEach(w => w.classList.remove('paused'));
        } else {
            bgMusic.pause();
            wheels.forEach(w => w.classList.add('paused'));
        }
    });

    // Кнопка глотка пива
    pourBeerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Чтобы клик не сбивал экран залипания раньше времени
        beerLiters += 0.5;
        beerCountEl.textContent = beerLiters.toFixed(1);

        triggerGlitchFlash(150);

        // Тактильный виброотклик на смартфонах
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        beerCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            beerCountEl.style.transform = 'scale(1)';
        }, 120);
    });

    // Настройка приглушения звука через Web Audio API
    function initAudioFilters() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            source = audioCtx.createMediaElementSource(bgMusic);
            
            lowpassFilter = audioCtx.createBiquadFilter();
            lowpassFilter.type = 'lowpass';
            // Открываем частоты полностью на старте
            lowpassFilter.frequency.setValueAtTime(20000, audioCtx.currentTime);

            source.connect(lowpassFilter);
            lowpassFilter.connect(audioCtx.destination);
        } catch(err) {
            console.log("Локальный запуск или Web Audio контекст ограничен браузером", err);
        }
    }

    // Сброс таймера бездействия
    function resetIdleTimer() {
        if (idleScreen.classList.contains('active-idle')) {
            if (lowpassFilter && audioCtx && audioCtx.state !== 'suspended') {
                // Плавно возвращаем высокие частоты звука за 0.4 секунды
                lowpassFilter.frequency.exponentialRampToValueAtTime(20000, audioCtx.currentTime + 0.4);
            }
            idleScreen.classList.remove('active-idle');
            triggerGlitchFlash(200);
        }

        clearTimeout(idleTimer);
        if (!introScreen.classList.contains('hidden')) return;

        // Время до ухода в "Залипание" — 12 секунд
        idleTimer = setTimeout(activateIdleMode, 12000);
    }

    function activateIdleMode() {
        idleScreen.classList.add('active-idle');
        if (lowpassFilter && audioCtx && audioCtx.state !== 'suspended') {
            // Глушим звук до 450 Гц за 1.5 секунды (эффект музыки за стеной)
            lowpassFilter.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 1.5);
        }
    }

    // СЛУШАТЕЛИ ДЛЯ ПОЛНОЙ АДАПТИВНОСТИ:
    // Поддержка смартфонов (тапы и скролл)
    window.addEventListener('touchstart', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    // Поддержка компьютеров (движение мыши, колесико, клики)
    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('wheel', resetIdleTimer, { passive: true });
    window.addEventListener('click', resetIdleTimer, { passive: true });

});
