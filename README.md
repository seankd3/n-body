# N-Body Physics Simulation

A web-based N-body gravitational simulation that demonstrates the motion of celestial bodies under the influence of gravity.

## Features

- Real-time simulation of N-body gravitational interactions
- Customizable physical parameters (masses, velocities, positions)
- Visual representation of orbits and trajectories
- Add/remove bodies dynamically
- Adjustable simulation speed and accuracy

## How to Use

1. Open `index.html` in a modern web browser
2. Use the controls to add new bodies, adjust parameters, or reset the simulation
3. Watch how the bodies interact through gravitational forces

## Physics Background

This simulation uses Newton's law of universal gravitation to calculate the forces between bodies:

F = G * (m1 * m2) / r²

Where:
- F is the gravitational force between two bodies
- G is the gravitational constant
- m1 and m2 are the masses of the two bodies
- r is the distance between the centers of the two bodies

The simulation uses numerical integration methods to update the positions and velocities of each body over time.

## Inspired by

This project was inspired by the Principia mod for Kerbal Space Program, which implements N-body gravitation in the game.
