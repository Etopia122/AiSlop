# Mario-Inspired 2D Platformer Engine

A comprehensive 2D platformer game engine built with HTML5 Canvas and JavaScript, featuring classic Super Mario Bros. mechanics and gameplay elements.

## Features

### Core Engine Features
- **Modular Architecture**: Clean separation of concerns with core systems, entities, and game states
- **Physics System**: Realistic gravity, collision detection, and Mario-style movement mechanics
- **Animation System**: Sprite-based animations with frame management
- **Audio System**: Web Audio API integration with Mario-style sound effects
- **Input System**: Comprehensive keyboard input handling with customizable key mappings
- **Render System**: Optimized rendering with visual effects, particles, and screen effects
- **State Management**: Menu, gameplay, and game over states with smooth transitions

### Mario-Inspired Gameplay
- **Player Character**: Full Mario mechanics with small, big, and fire power states
- **Variable Jump Height**: Hold jump button for higher jumps
- **Power-Up System**: Mushrooms (grow), Fire Flowers (fire power)
- **Enemy System**: Goombas (stompable) and Koopa Troopas (shell mechanics)
- **Block System**: Question blocks, brick blocks, and invisible blocks
- **Collectibles**: Coins with sparkle effects
- **Projectiles**: Fireballs with bouncing physics and particle trails
- **Level System**: Platforms, pipes, and hazards

### Technical Features
- **Collision Detection**: Spatial partitioning for optimized collision checking
- **Camera System**: Smooth following camera with bounds
- **Particle Effects**: Visual feedback for actions and interactions
- **Debug Mode**: Collision visualization and performance monitoring
- **Responsive Design**: Pixel-perfect rendering with crisp edges

## Getting Started

### Prerequisites
- Modern web browser with JavaScript support
- Local web server (for development)

### Installation

1. Clone or download the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

### Alternative Setup (No Dependencies)
1. Simply open `index.html` in a modern web browser
2. Note: Some features may require a local server due to browser security restrictions

## Controls

### Basic Controls
- **Arrow Keys**: Move left/right, crouch (down)
- **Space**: Jump (hold for higher jumps)
- **Z**: Run (hold while moving)
- **X**: Shoot fireballs (when Fire Mario)
- **R**: Restart level
- **ESC**: Pause/Resume game
- **D**: Toggle debug mode

### Menu Navigation
- **Arrow Keys**: Navigate menu options
- **Space/Enter**: Select menu option

## Game Mechanics

### Power-Up System
1. **Small Mario**: Default state, vulnerable to all damage
2. **Big Mario**: Gained from Super Mushroom, can break blocks, takes 2 hits
3. **Fire Mario**: Gained from Fire Flower, can shoot fireballs

### Enemy Behavior
- **Goombas**: Simple walking enemies, defeated by stomping
- **Koopa Troopas**: Retreat into shell when stomped, can be kicked

### Block Types
- **Question Blocks**: Contain power-ups or coins
- **Brick Blocks**: Can be broken by Big/Fire Mario
- **Invisible Blocks**: Hidden until activated

### Scoring System
- **Coins**: 200 points each
- **Enemy Defeat**: 100 points each
- **Power-ups**: 1000 points each
- **Block Breaking**: 50 points each

## Architecture

### Core Systems
```
src/
├── core/
│   ├── Vector2.js          # 2D vector mathematics
│   ├── GameObject.js       # Base class for all game objects
│   ├── Physics.js          # Physics and collision handling
│   ├── Input.js           # Keyboard input management
│   ├── Audio.js           # Sound effects and music
│   └── GameEngine.js      # Main engine coordination
├── systems/
│   ├── AnimationSystem.js  # Sprite animation management
│   ├── CollisionSystem.js  # Collision detection and response
│   └── RenderSystem.js     # Rendering and visual effects
├── entities/
│   ├── Player.js          # Mario character with all mechanics
│   ├── Enemy.js           # Base enemy class
│   ├── Goomba.js          # Goomba enemy implementation
│   ├── Koopa.js           # Koopa Troopa with shell mechanics
│   ├── PowerUp.js         # Base power-up class
│   ├── Mushroom.js        # Super Mushroom power-up
│   ├── FireFlower.js      # Fire Flower power-up
│   ├── Fireball.js        # Fireball projectile
│   ├── Coin.js            # Collectible coins
│   ├── Block.js           # Interactive blocks
│   └── Pipe.js            # Warp pipes
├── states/
│   ├── GameState.js       # Base game state class
│   ├── MenuState.js       # Main menu with animations
│   ├── PlayState.js       # Main gameplay state
│   └── GameOverState.js   # Game over screen
└── Game.js               # Main game initialization
```

### Entity System
All game objects inherit from the `GameObject` base class, providing:
- Position and velocity management
- Collision detection boundaries
- Animation support
- Tag-based identification
- Physics properties

### State Management
The engine uses a state machine pattern:
- **MenuState**: Animated main menu with navigation
- **PlayState**: Core gameplay with level management
- **GameOverState**: Final score display and options

## Development

### Adding New Entities
1. Create a new class extending `GameObject` or appropriate base class
2. Implement required methods: `update()`, `render()`, collision handlers
3. Add to the level creation system in `PlayState.js`

### Creating Custom Levels
Level data is defined in `PlayState.js` in the `create*` methods:
- `createGround()`: Ground tiles and platforms
- `createEnemies()`: Enemy placement
- `createBlocks()`: Interactive blocks
- `createCoins()`: Collectible placement

### Debug Features
- Press `D` to toggle debug mode (shows collision boxes and velocity vectors)
- Use browser console functions:
  - `debugGame()`: Display engine information
  - `addDebugObject(type, x, y)`: Add objects at runtime
  - `toggleDebug()`: Toggle debug visualization

## Performance Optimization

### Spatial Partitioning
The collision system uses spatial partitioning to reduce collision checks from O(n²) to approximately O(n).

### Viewport Culling
Only objects within the camera view (plus margin) are rendered and updated.

### Object Pooling
Particles and effects are managed with efficient pooling systems.

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Required Features
- HTML5 Canvas
- Web Audio API
- ES6 Classes
- RequestAnimationFrame

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Super Mario Bros. series by Nintendo
- Built with modern web technologies
- Designed for educational and entertainment purposes

## Future Enhancements

- [ ] Sprite sheets and improved graphics
- [ ] Multiple levels and world progression
- [ ] Additional power-ups and enemies
- [ ] Sound effects and background music
- [ ] Mobile touch controls
- [ ] Level editor
- [ ] Multiplayer support
- [ ] Save/load game state
- [ ] Achievement system
- [ ] Performance profiling tools

## API Reference

### Core Classes

#### GameEngine
Main engine class that coordinates all systems.

```javascript
const engine = new GameEngine(canvas);
engine.start();
```

#### GameObject
Base class for all game entities.

```javascript
class MyEntity extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.addTag('myEntity');
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        // Custom logic
    }
}
```

#### Vector2
2D vector mathematics utility.

```javascript
const position = new Vector2(100, 200);
const velocity = Vector2.right().multiply(speed);
```

### Global Debug Functions

```javascript
// Display current game state
debugGame();

// Add objects for testing
addDebugObject('goomba', 300, 400);
addDebugObject('coin', 250, 350);

// Toggle debug visualization
toggleDebug();
```

For detailed API documentation, refer to the inline comments in the source code.