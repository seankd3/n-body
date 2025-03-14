/**
 * Physics engine for N-body gravitational simulation
 */

class PhysicsEngine {
    constructor() {
        // Gravitational constant (scaled for simulation)
        this.G = 6.67430e-2;
        
        // List of all bodies in the simulation
        this.bodies = [];
        
        // Simulation parameters
        this.timeStep = 0.01;   // dt for integration
        this.timeScale = 1.0;   // Speed multiplier
        this.isPaused = true;
        
        // Numerical integration method (default: Verlet)
        this.integrationMethod = this.verletIntegration;
    }
    
    /**
     * Add a new body to the simulation
     * @param {Object} bodyData Object containing body properties
     */
    addBody(bodyData) {
        const body = {
            id: Date.now().toString(),
            name: bodyData.name || `Body ${this.bodies.length + 1}`,
            mass: bodyData.mass || 1.0,
            radius: bodyData.radius || 10,
            color: bodyData.color || "#FFFFFF",
            position: {
                x: bodyData.position?.x || 0,
                y: bodyData.position?.y || 0
            },
            velocity: {
                x: bodyData.velocity?.x || 0,
                y: bodyData.velocity?.y || 0
            },
            acceleration: {
                x: 0,
                y: 0
            },
            trail: [],
            maxTrailLength: 100
        };
        
        this.bodies.push(body);
        return body.id;
    }
    
    /**
     * Remove a body from the simulation by ID
     * @param {string} id ID of the body to remove
     */
    removeBody(id) {
        this.bodies = this.bodies.filter(body => body.id !== id);
    }
    
    /**
     * Reset the simulation to its initial state
     */
    reset() {
        this.bodies = [];
    }
    
    /**
     * Calculate the gravitational force between two bodies
     * @param {Object} body1 First body
     * @param {Object} body2 Second body
     * @returns {Object} Force vector {x, y}
     */
    calculateGravitationalForce(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        
        // Distance between bodies (with small softening factor to prevent division by zero)
        const distanceSquared = dx * dx + dy * dy + 1e-10;
        const distance = Math.sqrt(distanceSquared);
        
        // Calculate gravitational force magnitude: F = G * (m1 * m2) / r^2
        const forceMagnitude = this.G * body1.mass * body2.mass / distanceSquared;
        
        // Force components (direction from body1 to body2)
        return {
            x: forceMagnitude * dx / distance,
            y: forceMagnitude * dy / distance
        };
    }
    
    /**
     * Calculate the center of mass of the system
     * @returns {Object} Center of mass position {x, y}
     */
    calculateCenterOfMass() {
        if (this.bodies.length === 0) return { x: 0, y: 0 };
        
        let totalMass = 0;
        let centerX = 0;
        let centerY = 0;
        
        for (const body of this.bodies) {
            totalMass += body.mass;
            centerX += body.position.x * body.mass;
            centerY += body.position.y * body.mass;
        }
        
        return {
            x: centerX / totalMass,
            y: centerY / totalMass
        };
    }
    
    /**
     * Update the accelerations of all bodies based on gravitational forces
     */
    updateAccelerations() {
        // Reset all accelerations to zero
        for (const body of this.bodies) {
            body.acceleration.x = 0;
            body.acceleration.y = 0;
        }
        
        // Calculate forces between each pair of bodies (O(n²) approach)
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                // Calculate gravitational force between the two bodies
                const force = this.calculateGravitationalForce(body1, body2);
                
                // Apply force to both bodies (equal and opposite)
                body1.acceleration.x += force.x / body1.mass;
                body1.acceleration.y += force.y / body1.mass;
                
                body2.acceleration.x -= force.x / body2.mass;
                body2.acceleration.y -= force.y / body2.mass;
            }
        }
    }
    
    /**
     * Perform velocity Verlet integration to update positions and velocities
     * More stable than Euler integration for orbital mechanics
     */
    verletIntegration() {
        const dt = this.timeStep * this.timeScale;
        
        // Update positions using current velocities and half-step accelerations
        for (const body of this.bodies) {
            // Save old acceleration for velocity update
            const oldAx = body.acceleration.x;
            const oldAy = body.acceleration.y;
            
            // Update position: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
            body.position.x += body.velocity.x * dt + 0.5 * oldAx * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * oldAy * dt * dt;
            
            // Add current position to the trail
            if (body.trail.length >= body.maxTrailLength) {
                body.trail.shift(); // Remove oldest point if trail is too long
            }
            body.trail.push({ x: body.position.x, y: body.position.y });
        }
        
        // Recalculate accelerations with new positions
        this.updateAccelerations();
        
        // Update velocities using average of old and new accelerations
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            
            // Retrieve old accelerations (saved locally above)
            const oldAx = body.acceleration.x;
            const oldAy = body.acceleration.y;
            
            // Update velocity: v(t+dt) = v(t) + 0.5*[a(t) + a(t+dt)]*dt
            body.velocity.x += 0.5 * (oldAx + body.acceleration.x) * dt;
            body.velocity.y += 0.5 * (oldAy + body.acceleration.y) * dt;
        }
    }
    
    /**
     * Euler integration method (simpler but less accurate)
     */
    eulerIntegration() {
        const dt = this.timeStep * this.timeScale;
        
        // Calculate all accelerations
        this.updateAccelerations();
        
        // Update velocities and positions
        for (const body of this.bodies) {
            // Update velocity: v(t+dt) = v(t) + a(t)*dt
            body.velocity.x += body.acceleration.x * dt;
            body.velocity.y += body.acceleration.y * dt;
            
            // Update position: x(t+dt) = x(t) + v(t+dt)*dt
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            
            // Add current position to the trail
            if (body.trail.length >= body.maxTrailLength) {
                body.trail.shift(); // Remove oldest point if trail is too long
            }
            body.trail.push({ x: body.position.x, y: body.position.y });
        }
    }
    
    /**
     * Update the simulation by one time step
     */
    update() {
        if (this.isPaused || this.bodies.length < 1) return;
        
        // Perform numerical integration
        this.integrationMethod.call(this);
    }
    
    /**
     * Set up the Solar System preset
     */
    setupSolarSystem() {
        this.reset();
        
        // Sun (at center)
        this.addBody({
            name: "Sun",
            mass: 1000,
            radius: 20,
            color: "#FFFF00",
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 }
        });
        
        // Mercury
        this.addBody({
            name: "Mercury",
            mass: 0.055,
            radius: 5,
            color: "#888888",
            position: { x: 100, y: 0 },
            velocity: { x: 0, y: 4 }
        });
        
        // Venus
        this.addBody({
            name: "Venus",
            mass: 0.815,
            radius: 8,
            color: "#E39E1C",
            position: { x: 150, y: 0 },
            velocity: { x: 0, y: 3.5 }
        });
        
        // Earth
        this.addBody({
            name: "Earth",
            mass: 1,
            radius: 10,
            color: "#1E88E5",
            position: { x: 200, y: 0 },
            velocity: { x: 0, y: 3 }
        });
        
        // Mars
        this.addBody({
            name: "Mars",
            mass: 0.107,
            radius: 7,
            color: "#D81B60",
            position: { x: 250, y: 0 },
            velocity: { x: 0, y: 2.5 }
        });
    }
    
    /**
     * Set up a binary star system preset
     */
    setupBinaryStars() {
        this.reset();
        
        // Star 1
        this.addBody({
            name: "Star A",
            mass: 500,
            radius: 15,
            color: "#FF5722",
            position: { x: -100, y: 0 },
            velocity: { x: 0, y: -1.5 }
        });
        
        // Star 2
        this.addBody({
            name: "Star B",
            mass: 500,
            radius: 15,
            color: "#2196F3",
            position: { x: 100, y: 0 },
            velocity: { x: 0, y: 1.5 }
        });
        
        // Planet orbiting the binary system
        this.addBody({
            name: "Planet",
            mass: 1,
            radius: 8,
            color: "#4CAF50",
            position: { x: 0, y: 300 },
            velocity: { x: 2.5, y: 0 }
        });
    }
    
    /**
     * Set up a three-body system
     */
    setupThreeBodySystem() {
        this.reset();
        
        // Body 1
        this.addBody({
            name: "Body A",
            mass: 100,
            radius: 15,
            color: "#E91E63",
            position: { x: -100, y: -100 },
            velocity: { x: 1, y: 1 }
        });
        
        // Body 2
        this.addBody({
            name: "Body B",
            mass: 100,
            radius: 15,
            color: "#FFC107",
            position: { x: 100, y: -100 },
            velocity: { x: -1, y: 1 }
        });
        
        // Body 3
        this.addBody({
            name: "Body C",
            mass: 100,
            radius: 15,
            color: "#3F51B5",
            position: { x: 0, y: 100 },
            velocity: { x: 0, y: -1 }
        });
    }
}
