/**
 * Pomodoro Wave Timer
 * Professional implementation of a multi-stage timer.
 */

// Configuration
const CONFIG = {
    SESSION_DURATION: 25 * 60, // 25 minutes in seconds
    BREAK_DURATION: 5 * 60,    // 5 minutes in seconds
    AUDIO_SRC: 'https://pharmx.co.uk/congrats.mp3'
};

class PomodoroTimer {
    constructor() {
        this.currentSessionIndex = 0;
        this.blocks = document.querySelectorAll('.block');
        this.timers = [];
        this.audio = new Audio(CONFIG.AUDIO_SRC);
        
        this.init();
    }

    init() {
        this.blocks.forEach((block, index) => {
            const state = {
                mode: 'idle', // idle, session, break, completed
                remaining: CONFIG.SESSION_DURATION,
                interval: null,
                elements: {
                    timer: block.querySelector('.timer'),
                    button: block.querySelector('button'),
                    status: block.querySelector('.status'),
                    wave: block.querySelector('.wave')
                }
            };
            
            this.timers[index] = state;
            this.updateDisplay(index);

            // Initial button state
            if (index !== this.currentSessionIndex) {
                state.elements.button.disabled = true;
            }

            // Event Listeners
            state.elements.button.addEventListener('click', () => this.handleButtonClick(index));
        });
    }

    handleButtonClick(index) {
        if (index !== this.currentSessionIndex) return;

        const state = this.timers[index];

        switch (state.mode) {
            case 'idle':
                this.startSession(index);
                break;
            case 'session':
            case 'break':
                if (state.interval) {
                    this.pauseTimer(index);
                } else {
                    this.resumeTimer(index);
                }
                break;
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    updateDisplay(index) {
        const state = this.timers[index];
        const timeString = this.formatTime(state.remaining);
        state.elements.timer.textContent = timeString;
        // Hide wave effect
        state.elements.wave.style.display = 'none';
        // Update document title if running
        if (state.interval) {
            document.title = `(${timeString}) PharmX Pomodoro`;
        } else if (state.mode === 'idle') {
            document.title = 'Pomodoro Wave Timer by PharmX | Pharmacy Education';
        }
    }

    startSession(index) {
        const state = this.timers[index];
        state.mode = 'session';
        state.remaining = CONFIG.SESSION_DURATION;
        state.elements.button.textContent = "Pause";
        state.elements.status.textContent = "Focus Time";
        this.startTicker(index);
    }

    startTicker(index) {
        const state = this.timers[index];
        if (state.interval) clearInterval(state.interval);
        
        state.interval = setInterval(() => {
            state.remaining--;
            this.updateDisplay(index);

            if (state.remaining <= 0) {
                this.handleTimerComplete(index);
            }
        }, 1000);
    }

    pauseTimer(index) {
        const state = this.timers[index];
        clearInterval(state.interval);
        state.interval = null;
        state.elements.button.textContent = "Resume";
        document.title = 'Paused - PharmX Pomodoro';
    }

    resumeTimer(index) {
        const state = this.timers[index];
        state.elements.button.textContent = "Pause";
        this.startTicker(index);
    }

    handleTimerComplete(index) {
        const state = this.timers[index];
        clearInterval(state.interval);
        state.interval = null;

        this.playAlert();

        if (state.mode === 'session') {
            // Switch to break
            state.mode = 'break';
            state.remaining = CONFIG.BREAK_DURATION;
            state.elements.button.textContent = "Start Break";
            state.elements.status.textContent = "Break Time";
            // Auto-start break or wait for user? 
            // Original code auto-started break. Let's keep it auto-start for flow.
            this.startTicker(index);
        } else if (state.mode === 'break') {
            // Session fully complete
            state.mode = 'completed';
            state.elements.button.textContent = "Completed";
            state.elements.button.disabled = true;
            state.elements.status.textContent = "Session Complete";
            // No wave effect
            
            this.advanceToNextBlock();
        }
    }

    advanceToNextBlock() {
        if (this.currentSessionIndex < this.blocks.length - 1) {
            this.currentSessionIndex++;
            const nextState = this.timers[this.currentSessionIndex];
            nextState.elements.button.disabled = false;
            nextState.elements.status.textContent = "Ready to start";
        }
    }

    playAlert() {
        this.audio.play().catch(err => console.log('Audio play failed:', err));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
