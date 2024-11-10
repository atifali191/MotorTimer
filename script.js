class Motor {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.time = 0;
        this.isRunning = false;
        this.interval = null;
    }
}

class MotorTracker {
    constructor() {
        this.motors = new Map();
        this.initializeDefaultMotors();
        this.setupEventListeners();
        this.loadDarkModePreference();
    }

    initializeDefaultMotors() {
        const defaultMotors = [
            { name: 'Sump-Bedroom', color: '#ff9999' },
            { name: 'Sump-Kitchen', color: '#99ff99' },
            { name: 'Tank 1', color: '#9999ff' },
            { name: 'Tank 2', color: '#ffff99' },
            { name: 'Tank 3', color: '#ff99ff' }
        ];

        defaultMotors.forEach(motor => {
            this.addMotor(motor.name, motor.color, true);
        });
    }

    addMotor(name, color, isDefault = false) {
        const motor = new Motor(name, color);
        motor.isDefault = isDefault;
        this.motors.set(name, motor);
        this.renderMotor(motor);
    }

    removeMotor(name) {
        const motor = this.motors.get(name);
        if (motor && !motor.isDefault) {
            if (motor.interval) clearInterval(motor.interval);
            this.motors.delete(name);
            document.querySelector(`[data-motor="${name}"]`).remove();
        }
    }

    startMotor(name) {
        const motor = this.motors.get(name);
        if (motor && !motor.isRunning) {
            motor.isRunning = true;
            motor.interval = setInterval(() => {
                motor.time++;
                this.updateTimer(name);
            }, 1000);
        }
    }

    stopMotor(name) {
        const motor = this.motors.get(name);
        if (motor && motor.isRunning) {
            motor.isRunning = false;
            clearInterval(motor.interval);
            motor.interval = null;
        }
    }

    resetMotor(name) {
        const motor = this.motors.get(name);
        if (motor) {
            motor.time = 0;
            this.updateTimer(name);
        }
    }

    updateTimer(name) {
        const motor = this.motors.get(name);
        const timerElement = document.querySelector(`[data-motor="${name}"] .timer`);
        const hours = Math.floor(motor.time / 3600);
        const minutes = Math.floor((motor.time % 3600) / 60);
        const seconds = motor.time % 60;
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    renderMotor(motor) {
        const motorList = document.getElementById('motorList');
        const motorElement = document.createElement('div');
        motorElement.className = 'motor-card';
        motorElement.dataset.motor = motor.name;
        motorElement.style.background = `linear-gradient(135deg, ${motor.color}40, transparent)`;

        motorElement.innerHTML = `
            <h3>${motor.name}</h3>
            <div class="timer">00:00:00</div>
            <div class="motor-controls">
                <button class="button success-button start-button">
                    <span class="material-icons">play_arrow</span>
                    Start
                </button>
                <button class="button danger-button stop-button">
                    <span class="material-icons">stop</span>
                    Stop
                </button>
                <button class="button primary-button reset-button">
                    <span class="material-icons">refresh</span>
                    Reset
                </button>
                ${motor.isDefault ? '' : `
                    <button class="button danger-button remove-button">
                        <span class="material-icons">delete</span>
                        Remove
                    </button>
                `}
            </div>
        `;

        motorList.appendChild(motorElement);
        this.attachMotorEventListeners(motorElement, motor.name);
    }

    attachMotorEventListeners(motorElement, motorName) {
        motorElement.querySelector('.start-button').addEventListener('click', () => this.startMotor(motorName));
        motorElement.querySelector('.stop-button').addEventListener('click', () => this.stopMotor(motorName));
        motorElement.querySelector('.reset-button').addEventListener('click', () => this.resetMotor(motorName));
        const removeButton = motorElement.querySelector('.remove-button');
        if (removeButton) {
            removeButton.addEventListener('click', () => this.removeMotor(motorName));
        }
    }

    exportData() {
        let exportText = 'Water Motor Usage Report\n';
        exportText += '=====================\n\n';
        
        this.motors.forEach((motor, name) => {
            const hours = Math.floor(motor.time / 3600);
            const minutes = Math.floor((motor.time % 3600) / 60);
            const seconds = motor.time % 60;
            exportText += `${name}: ${hours}h ${minutes}m ${seconds}s\n`;
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'motor-usage-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearAll() {
        this.motors.forEach((motor, name) => {
            this.resetMotor(name);
        });
    }

    toggleDarkMode() {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('darkMode', document.body.dataset.theme);
    }

    loadDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode) {
            document.body.dataset.theme = darkMode;
        }
    }

    setupEventListeners() {
        document.getElementById('addMotor').addEventListener('click', () => {
            const name = document.getElementById('motorName').value.trim();
            const color = document.getElementById('motorColor').value;
            if (name && !this.motors.has(name)) {
                this.addMotor(name, color);
                document.getElementById('motorName').value = '';
            }
        });

        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.motorTracker = new MotorTracker();
}); 