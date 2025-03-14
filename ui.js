/**
 * UI handler for N-body gravitational simulation
 * Manages all user interactions with the simulation
 */

class UIHandler {
    constructor(physics, renderer) {
        this.physics = physics;
        this.renderer = renderer;
        
        // Control elements
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedValue = document.getElementById('speed-value');
        this.timeStepSlider = document.getElementById('time-step-slider');
        this.timeStepValue = document.getElementById('time-step-value');
        this.showTrailsCheckbox = document.getElementById('show-trails');
        this.centerOfMassCheckbox = document.getElementById('center-of-mass');
        this.bodiesList = document.getElementById('bodies-list');
        this.addBodyBtn = document.getElementById('add-body-btn');
        this.solarSystemBtn = document.getElementById('solar-system-btn');
        this.binaryStarsBtn = document.getElementById('binary-stars-btn');
        this.threeBodyBtn = document.getElementById('three-body-btn');
        
        // Modal elements
        this.addBodyModal = document.getElementById('add-body-modal');
        this.closeModalBtn = document.querySelector('.close');
        this.addBodyForm = document.getElementById('add-body-form');
        
        // Initialize UI
        this.setupEventListeners();
        this.updateBodiesList();
        this.setupZoomAndPan();
    }
    
    /**
     * Set up all event listeners for the UI
     */
    setupEventListeners() {
        // Start/Pause button
        this.startPauseBtn.addEventListener('click', () => {
            this.physics.isPaused = !this.physics.isPaused;
            this.startPauseBtn.textContent = this.physics.isPaused ? 'Start' : 'Pause';
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.physics.reset();
            this.updateBodiesList();
        });
        
        // Speed slider
        this.speedSlider.addEventListener('input', () => {
            this.physics.timeScale = parseFloat(this.speedSlider.value);
            this.speedValue.textContent = `${this.physics.timeScale.toFixed(1)}x`;
        });
        
        // Time step slider
        this.timeStepSlider.addEventListener('input', () => {
            this.physics.timeStep = parseFloat(this.timeStepSlider.value);
            this.timeStepValue.textContent = this.physics.timeStep.toFixed(2);
        });
        
        // Show trails checkbox
        this.showTrailsCheckbox.addEventListener('change', () => {
            this.renderer.setShowTrails(this.showTrailsCheckbox.checked);
        });
        
        // Center on center of mass checkbox
        this.centerOfMassCheckbox.addEventListener('change', () => {
            this.renderer.setCenterOnMassCenter(this.centerOfMassCheckbox.checked);
        });
        
        // Add body button
        this.addBodyBtn.addEventListener('click', () => {
            this.addBodyModal.style.display = 'block';
        });
        
        // Preset buttons
        this.solarSystemBtn.addEventListener('click', () => {
            this.physics.setupSolarSystem();
            this.updateBodiesList();
        });
        
        this.binaryStarsBtn.addEventListener('click', () => {
            this.physics.setupBinaryStars();
            this.updateBodiesList();
        });
        
        this.threeBodyBtn.addEventListener('click', () => {
            this.physics.setupThreeBodySystem();
            this.updateBodiesList();
        });
        
        // Close modal button
        this.closeModalBtn.addEventListener('click', () => {
            this.addBodyModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.addBodyModal) {
                this.addBodyModal.style.display = 'none';
            }
        });
        
        // Add body form submission
        this.addBodyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const bodyData = {
                name: document.getElementById('body-name').value,
                mass: parseFloat(document.getElementById('body-mass').value),
                radius: parseFloat(document.getElementById('body-radius').value),
                color: document.getElementById('body-color').value,
                position: {
                    x: parseFloat(document.getElementById('body-x').value),
                    y: parseFloat(document.getElementById('body-y').value)
                },
                velocity: {
                    x: parseFloat(document.getElementById('body-vx').value),
                    y: parseFloat(document.getElementById('body-vy').value)
                }
            };
            
            this.physics.addBody(bodyData);
            this.updateBodiesList();
            this.addBodyModal.style.display = 'none';
            this.addBodyForm.reset();
        });
    }
    
    /**
     * Update the list of bodies in the UI
     */
    updateBodiesList() {
        this.bodiesList.innerHTML = '';
        
        for (const body of this.physics.bodies) {
            const bodyItem = document.createElement('div');
            bodyItem.className = 'body-item';
            
            const bodyColor = document.createElement('span');
            bodyColor.className = 'body-color';
            bodyColor.style.backgroundColor = body.color;
            
            const bodyName = document.createElement('span');
            bodyName.textContent = `${body.name} (Mass: ${body.mass.toFixed(1)})`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-body';
            removeBtn.textContent = 'X';
            removeBtn.onclick = () => {
                this.physics.removeBody(body.id);
                this.updateBodiesList();
            };
            
            bodyItem.appendChild(bodyColor);
            bodyItem.appendChild(bodyName);
            bodyItem.appendChild(removeBtn);
            
            this.bodiesList.appendChild(bodyItem);
        }
    }
    
    /**
     * Set up zoom and pan functionality for the canvas
     */
    setupZoomAndPan() {
        const canvas = this.renderer.canvas;
        let isDragging = false;
        let lastX, lastY;
        let scale = 1.0;
        
        // Mouse wheel for zooming
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            // Adjust zoom level based on wheel direction
            const delta = -Math.sign(event.deltaY) * 0.1;
            scale = Math.max(0.1, Math.min(5, scale + delta));
            
            this.renderer.setScale(scale);
        });
        
        // Mouse down for panning
        canvas.addEventListener('mousedown', (event) => {
            isDragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
            canvas.style.cursor = 'grabbing';
        });
        
        // Mouse move for panning
        canvas.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            
            this.renderer.offset.x += dx;
            this.renderer.offset.y += dy;
            
            lastX = event.clientX;
            lastY = event.clientY;
        });
        
        // Mouse up to stop panning
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            canvas.style.cursor = 'default';
        });
        
        // Mouse leave to stop panning
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            canvas.style.cursor = 'default';
        });
    }
}
