document.addEventListener('DOMContentLoaded', () => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const textInput = document.getElementById('text-input');
    const sendButton = document.getElementById('send-button');
    const characterImage = document.getElementById('character-image');
    const voiceSelect = document.getElementById('voice-select');
    const status = document.getElementById('status');
    const muteButton = document.getElementById('mute-button');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLabel = document.getElementById('volume-label');
    const iconUnmuted = document.getElementById('icon-unmuted');
    const iconMuted = document.getElementById('icon-muted');

    // ── Audio state ────────────────────────────────────────────────
    let isMuted = false;
    let lastVolume = 1.0;

    function getCurrentVolume() {
        return isMuted ? 0 : parseFloat(volumeSlider.value);
    }

    function updateVolumeUI(value) {
        volumeLabel.textContent = Math.round(value * 100) + '%';
        const pct = value * 100;
        volumeSlider.style.background =
            `linear-gradient(to right, var(--primary-accent) ${pct}%, var(--border-color) ${pct}%)`;
    }

    function updateMuteIcon() {
        const muted = isMuted || parseFloat(volumeSlider.value) === 0;
        iconUnmuted.style.display = muted ? 'none' : 'block';
        iconMuted.style.display   = muted ? 'block' : 'none';
        muteButton.classList.toggle('muted', muted);
    }

    volumeSlider.addEventListener('input', () => {
        const val = parseFloat(volumeSlider.value);
        lastVolume = val || lastVolume;
        isMuted = (val === 0);
        updateMuteIcon();
        updateVolumeUI(val);
        if (speechSynthesis.speaking) speechSynthesis.cancel();
    });

    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            lastVolume = parseFloat(volumeSlider.value) || 1.0;
            volumeSlider.value = 0;
            updateVolumeUI(0);
        } else {
            volumeSlider.value = lastVolume;
            updateVolumeUI(lastVolume);
        }
        updateMuteIcon();
        if (speechSynthesis.speaking) speechSynthesis.cancel();
    });

    updateVolumeUI(1.0); // init track fill

    // ── Character images ───────────────────────────────────────────
    const openMouthImg   = `/static/images/char-mouth-open.png?v=${sessionId}`;
    const closedMouthImg = `/static/images/char-mouth-closed.png?v=${sessionId}`;

    characterImage.src = closedMouthImg;
    const preloadOpen = new Image();   preloadOpen.src = openMouthImg;
    const preloadClosed = new Image(); preloadClosed.src = closedMouthImg;

    let lipSyncInterval = null;

    function startLipSync() {
        stopLipSync();
        let mouthOpen = true;
        lipSyncInterval = setInterval(() => {
            characterImage.src = mouthOpen ? openMouthImg : closedMouthImg;
            mouthOpen = !mouthOpen;
        }, 150);
    }

    function stopLipSync() {
        if (lipSyncInterval) {
            clearInterval(lipSyncInterval);
            lipSyncInterval = null;
        }
        characterImage.src = closedMouthImg;
    }

    // ── Voice list ─────────────────────────────────────────────────
    let voices = [];

    function populateVoiceList() {
        const all = speechSynthesis.getVoices();
        if (all.length === 0) return; // not ready yet

        // Prefer Google voices, fall back to ALL available voices
        const google = all.filter(v => v.name.includes('Google'));
        voices = google.length > 0 ? google : all;

        voiceSelect.innerHTML = '';
        let preferredIdx = -1;

        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);

            // Prefer first en-US voice
            if (preferredIdx === -1 && voice.lang === 'en-US') {
                preferredIdx = i;
            }
        });

        if (preferredIdx !== -1) voiceSelect.selectedIndex = preferredIdx;
    }

    populateVoiceList();
    speechSynthesis.onvoiceschanged = populateVoiceList;

    // ── Typewriter ─────────────────────────────────────────────────
    const typewriter = (text, element, speed = 40) => {
        element.innerHTML = '';
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
            const segments = Array.from(segmenter.segment(text)).map(s => s.segment);
            let i = 0;
            (function type() {
                if (i < segments.length) {
                    element.innerHTML += segments[i++];
                    setTimeout(type, speed);
                }
            })();
        } else {
            let i = 0;
            (function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i++);
                    setTimeout(type, speed);
                }
            })();
        }
    };

    // ── Speech ─────────────────────────────────────────────────────
    const speak = (text) => {
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        stopLipSync();

        const volume = getCurrentVolume();
        if (volume === 0) return; // muted — skip

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = volume;

        // Attach voice if one is selected
        if (voiceSelect.options.length > 0) {
            const selectedName = voiceSelect.selectedOptions[0].getAttribute('data-name');
            const selectedVoice = voices.find(v => v.name === selectedName);
            if (selectedVoice) utterance.voice = selectedVoice;
        }

        // ── Lip sync ───────────────────────────────────────────────
        // onstart is unreliable in Chrome/Safari — start lip-sync immediately
        // and rely on onend/onerror to stop it.
        startLipSync();

        utterance.onend   = stopLipSync;
        utterance.onerror = (e) => {
            // 'canceled' fires when we call cancel() ourselves — ignore it
            if (e.error !== 'canceled') console.warn('Speech error:', e.error);
            stopLipSync();
        };

        // Chrome bug: speech gets stuck if page is backgrounded.
        // Re-queue it every 10 s as a workaround.
        const resumeTimer = setInterval(() => {
            if (!speechSynthesis.speaking) {
                clearInterval(resumeTimer);
                return;
            }
            speechSynthesis.pause();
            speechSynthesis.resume();
        }, 10000);

        utterance.onend = () => { clearInterval(resumeTimer); stopLipSync(); };

        speechSynthesis.speak(utterance);
    };

    // ── Send message ───────────────────────────────────────────────
    const handleSendMessage = async () => {
        const message = textInput.value.trim();
        if (!message) return;

        textInput.value = '';
        textInput.style.height = '50px';
        status.textContent = 'Thinking...';
        sendButton.disabled = true;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, session_id: sessionId }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            typewriter(data.response, status);
            speak(data.response);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = 'Sorry, something went wrong. Please try again.';
            typewriter(errorMessage, status);
        } finally {
            sendButton.disabled = false;
        }
    };

    sendButton.addEventListener('click', handleSendMessage);

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    textInput.addEventListener('input', () => {
        textInput.style.height = 'auto';
        textInput.style.height = `${textInput.scrollHeight}px`;
    });
});
