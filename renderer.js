/**
 * Renderer for N-body gravitational simulation
 * Handles all drawing operations on the canvas
 */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.showTrails = true;
        this.centerOnMassCenter = false;
        this.scale = 1.0;
        this.offset = { x: 0, y: 0 };
        
        // Set canvas size to match its display size
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize the canvas to match its display size
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Center the origin in the middle of the canvas
        this.offset.x = this.canvas.width / 2;
        this.offset.y = this.canvas.height / 2;
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid for reference
        this.drawGrid();
    }
    
    /**
     * Draw a grid on the canvas for reference
     */
    drawGrid() {
        const gridSize = 50 * this.scale;
        const numLinesX = Math.ceil(this.canvas.width / gridSize);
        const numLinesY = Math.ceil(this.canvas.height / gridSize);
        
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;
        
        // Calculate the offset for the grid to match the simulation center
        const offsetX = this.offset.x % gridSize;
        const offsetY = this.offset.y % gridSize;
        
        // Vertical lines
        for (let i = 0; i <= numLinesX; i++) {
            const x = i * gridSize + offsetX;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= numLinesY; i++) {
            const y = i * gridSize + offsetY;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw origin axes
        this.ctx.strokeStyle = '#555555';
        this.ctx.lineWidth = 1;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.offset.y);
        this.ctx.lineTo(this.canvas.width, this.offset.y);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.offset.x, 0);
        this.ctx.lineTo(this.offset.x, this.canvas.height);
        this.ctx.stroke();
    }
    
    /**
     * Convert simulation coordinates to canvas coordinates
     * @param {number} x X coordinate in simulation space
     * @param {number} y Y coordinate in simulation space
     * @returns {Object} Coordinates in canvas space {x, y}
     */
    simToCanvas(x, y) {
        return {
            x: x * this.scale + this.offset.x,
            y: y * this.scale + this.offset.y
        };
    }
    
    /**
     * Draw a trail for a body
     * @param {Object} body The body to draw the trail for
     */
    drawTrail(body) {
        if (!this.showTrails || body.trail.length < 2) return;
        
        this.ctx.beginPath();
        
        // Create a gradient for the trail
        const trailColor = hexToRgb(body.color);
        
        // Set line style
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, 0.6)`;
        
        // Draw trail path
        for (let i = 0; i < body.trail.length; i++) {
            const point = this.simToCanvas(body.trail[i].x, body.trail[i].y);
            
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
            
            // Reduce opacity for older trail points
            const opacity = 0.2 + (i / body.trail.length) * 0.8;
            this.ctx.strokeStyle = `rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${opacity})`;
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw a body on the canvas
     * @param {Object} body The body to draw
     */
    drawBody(body) {
        // Draw the trail first (if enabled)
        this.drawTrail(body);
        
        // Convert simulation coordinates to canvas coordinates
        const canvasPos = this.simToCanvas(body.position.x, body.position.y);
        
        // Draw the body
        this.ctx.beginPath();
        this.ctx.arc(canvasPos.x, canvasPos.y, body.radius * this.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = body.color;
        this.ctx.fill();
        
        // Add glow effect
        const glowSize = body.radius * 1.5 * this.scale;
        const gradient = this.ctx.createRadialGradient(
            canvasPos.x, canvasPos.y, body.radius * this.scale,
            canvasPos.x, canvasPos.y, glowSize
        );
        
        const rgbColor = hexToRgb(body.color);
        gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8)`);
        gradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`);
        
        this.ctx.beginPath();
        this.ctx.arc(canvasPos.x, canvasPos.y, glowSize, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw body name
        if (body.radius * this.scale > 4) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(body.name, canvasPos.x, canvasPos.y - body.radius * this.scale - 10);
        }
    }
    
    /**
     * Render the entire simulation
     * @param {PhysicsEngine} physics The physics engine containing the simulation data
     */
    render(physics) {
        this.clear();
        
        // If enabled, adjust the offset to center on the center of mass
        if (this.centerOnMassCenter && physics.bodies.length > 0) {
            const centerOfMass = physics.calculateCenterOfMass();
            this.offset.x = this.canvas.width / 2 - centerOfMass.x * this.scale;
            this.offset.y = this.canvas.height / 2 - centerOfMass.y * this.scale;
        }
        
        // Draw each body
        for (const body of physics.bodies) {
            this.drawBody(body);
        }
        
        // Draw simulation information
        this.drawInfo(physics);
    }
    
    /**
     * Draw simulation information on the canvas
     * @param {PhysicsEngine} physics The physics engine
     */
    drawInfo(physics) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Bodies: ${physics.bodies.length}`, 10, 20);
        this.ctx.fillText(`Time Scale: ${physics.timeScale.toFixed(1)}x`, 10, 40);
        this.ctx.fillText(`dt: ${physics.timeStep}`, 10, 60);
        this.ctx.fillText(`Status: ${physics.isPaused ? 'Paused' : 'Running'}`, 10, 80);
    }
    
    /**
     * Set whether to show trails
     * @param {boolean} show Whether to show trails
     */
    setShowTrails(show) {
        this.showTrails = show;
    }
    
    /**
     * Set whether to center on the center of mass
     * @param {boolean} center Whether to center on the center of mass
     */
    setCenterOnMassCenter(center) {
        this.centerOnMassCenter = center;
    }
    
    /**
     * Set the zoom scale
     * @param {number} scale The zoom scale
     */
    setScale(scale) {
        this.scale = scale;
    }
}

/**
 * Helper function to convert hex color to RGB
 * @param {string} hex The hex color
 * @returns {Object} The RGB color {r, g, b}
 */
function hexToRgb(hex) {
    // Remove the hash if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex color
    let r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    
    return { r, g, b };
}
