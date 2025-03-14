/**
 * Main entry point for the N-body gravitational simulation
 */

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the physics engine
    const physics = new PhysicsEngine();
    
    // Initialize the renderer
    const renderer = new Renderer('simulation-canvas');
    
    // Initialize the UI handler
    const ui = new UIHandler(physics, renderer);
    
    // Set up the default solar system
    physics.setupSolarSystem();
    ui.updateBodiesList();
    
    // Main animation loop
    function animate() {
        // Update physics
        physics.update();
        
        // Render the scene
        renderer.render(physics);
        
        // Request the next frame
        requestAnimationFrame(animate);
    }
    
    // Start the animation loop
    animate();
    
    // Create memory for tracking FPS
    let frameCount = 0;
    let lastTime = performance.now();
    const fpsElement = document.createElement('div');
    fpsElement.id = 'fps-counter';
    fpsElement.style.position = 'fixed';
    fpsElement.style.top = '10px';
    fpsElement.style.right = '10px';
    fpsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    fpsElement.style.color = 'white';
    fpsElement.style.padding = '5px';
    fpsElement.style.borderRadius = '5px';
    fpsElement.textContent = 'FPS: 0';
    document.body.appendChild(fpsElement);
    
    // FPS counter
    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;
        
        if (elapsed >= 1000) {
            const fps = Math.round((frameCount * 1000) / elapsed);
            fpsElement.textContent = `FPS: ${fps}`;
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    // Start FPS counter
    updateFPS();
});
