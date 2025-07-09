# Mario Platformer Level Editor Guide

Welcome to the Mario Platformer Level Editor! This comprehensive tool allows you to create custom levels that are fully compatible with the Mario platformer game engine.

## Getting Started

1. Open `level-editor.html` in your web browser
2. The editor will start with a basic level containing some ground tiles
3. Select tools from the left sidebar to start building your level
4. Use the "Test Level" button to play your creation in the main game

## Interface Overview

### Toolbar (Left Side)
- **Level Info**: Set level name, author, and size
- **Tool Palettes**: Different categories of objects you can place
- **Controls**: Level management and editor settings
- **Saved Levels**: Local storage for your creations
- **Minimap**: Overview of your entire level
- **Layers**: Control visibility of different object types

### Main Canvas
- **Grid**: Visual guide for precise placement
- **Camera**: Pan around with arrow keys or middle mouse
- **Zoom**: Mouse wheel to zoom in/out
- **Status Bar**: Shows current position, tool, and object count

## Tool Categories

### 🏗️ Tiles
Basic building blocks of your level:
- **Ground** (█): Standard brown ground tiles
- **Brick** (▣): Breakable brick tiles 
- **Stone** (▦): Solid stone tiles
- **Ice** (▢): Slippery ice platforms
- **Lava** (≈): Damaging lava tiles
- **Water** (~): Non-solid water areas
- **Cloud** (☁): Floating cloud platforms
- **Platform** (─): Green jump-through platforms

### 👾 Enemies
Add challenge to your level:
- **Goomba** (👾): Classic walking enemy
- **Koopa** (🐢): Turtle enemy with shell mechanics
- **Enemy** (👹): Generic enemy type

### 🍄 Power-ups
Collectibles and upgrades:
- **Coin** (🪙): Collectible coins for points
- **Mushroom** (🍄): Makes Mario grow bigger
- **Fire Flower** (🌸): Gives Mario fire power

### 📦 Blocks
Interactive level elements:
- **Question Block** (?): Contains power-ups when hit
- **Brick Block** (B): Can be broken by big Mario
- **Invisible Block** (□): Hidden blocks that appear when hit
- **Pipe** (║): Decorative warp pipes

### 🔧 Tools
Special editor functions:
- **Eraser** (🗑️): Remove objects from the level
- **Select** (📌): Selection tool (future feature)
- **Fill** (🪣): Fill tool (future feature)
- **Player Start** (🚩): Set Mario's starting position

## Controls

### Mouse Controls
- **Left Click**: Place selected tool
- **Right Click**: Remove object at cursor
- **Middle Click + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Shift + Drag**: Multi-place (paint mode)

### Keyboard Shortcuts
- **Arrow Keys**: Pan camera
- **Ctrl + Z**: Undo last action
- **Ctrl + Y**: Redo last action
- **Delete**: Remove object at cursor
- **D**: Toggle debug mode (in game)

### Editor Settings
- **Grid Size**: Change snap grid (16px, 32px, 64px)
- **Brush Size**: Paint multiple tiles at once (1x1 to 4x4)
- **Snap to Grid**: Toggle precise grid alignment
- **Show Grid**: Toggle grid visibility

## Level Management

### Saving Levels
1. Enter a level name in the "Level Name" field
2. Click "💾 Save Level"
3. Your level is saved to browser local storage
4. Select from "Saved Levels" dropdown to load later

### Testing Levels
1. Click "▶️ Test Level" 
2. The main game opens in a new window/tab
3. Your level loads automatically
4. Play through to test gameplay and difficulty

### Exporting/Importing
1. **Export**: Click "📤 Export Level" to get JSON data
2. **Copy/Download**: Share via clipboard or save as .json file
3. **Import**: Click "📥 Import Level" to load from JSON
4. **File Import**: Load .json files directly

### Level Properties
- **Name**: Display name for your level
- **Author**: Creator credit
- **Width**: Level width (50-200 tiles)
- **Height**: Automatically set to 20 tiles

## Design Tips

### Level Layout
- **Start Simple**: Begin with basic ground and platforms
- **Test Frequently**: Use "Test Level" to verify gameplay
- **Player Path**: Ensure Mario can navigate your level
- **Visual Clarity**: Use consistent tile patterns

### Enemy Placement
- **Spacing**: Don't overcrowd enemies
- **Fair Challenges**: Place enemies where players can see them
- **Power-up Balance**: Provide power-ups before difficult sections
- **Safe Zones**: Leave areas for players to rest

### Secrets and Rewards
- **Hidden Blocks**: Use invisible blocks for secrets
- **Coin Trails**: Guide players with coin placement
- **Multiple Paths**: Create high and low routes
- **Risk/Reward**: Make secrets worth the challenge

### Technical Considerations
- **Performance**: Very large levels may impact performance
- **Boundaries**: Ensure players can't fall into void areas
- **Player Start**: Set a safe starting position
- **Level End**: Design a clear completion area

## Layer System

Control what you see while editing:
- **Tiles**: Background terrain and platforms
- **Enemies**: All enemy types
- **Power-ups**: Coins, mushrooms, fire flowers
- **Blocks**: Interactive blocks and pipes
- **Grid**: Editor grid overlay

Toggle layers to focus on specific elements while building.

## Minimap

The minimap shows:
- **Overview**: Your entire level at a glance
- **Current View**: Red rectangle shows visible area
- **Object Density**: See where you've placed objects
- **Navigation**: Click to jump to areas

## Common Issues

### Level Won't Load
- Check JSON format in import data
- Ensure all required properties exist
- Try importing a simple level first

### Objects Not Appearing
- Check layer visibility settings
- Verify object is within level bounds
- Ensure correct tool category selected

### Performance Issues
- Reduce level size if experiencing lag
- Limit number of entities in view
- Close other browser tabs

### Testing Problems
- Ensure main game files are accessible
- Check browser console for errors
- Verify level data format is correct

## Advanced Features

### Keyboard Navigation
- Use arrow keys for precise camera movement
- Combine with zoom for detailed work
- Hold Shift while placing for continuous paint mode

### Undo/Redo System
- 50 levels of undo history
- Automatic state saving on each change
- Ctrl+Z/Ctrl+Y for quick corrections

### Grid Snapping
- Toggle snap to grid for precise alignment
- Different grid sizes for different detail levels
- Free placement mode for pixel-perfect positioning

## Level Sharing

### Community Sharing
1. Export your level to JSON
2. Share the JSON data with other players
3. Others can import and play your levels
4. Consider sharing on community forums or social media

### File Organization
- Save important levels as .json files
- Use descriptive filenames
- Keep backups of your best creations
- Organize by difficulty or theme

## Troubleshooting

If you encounter issues:
1. Refresh the page to reset the editor
2. Check browser console (F12) for error messages
3. Try a different browser if problems persist
4. Clear browser cache and local storage if needed

## Future Features

The level editor is designed to be extensible. Potential future additions:
- Selection and copy/paste tools
- Fill/flood tools for large areas
- Custom tile textures
- Animation preview
- Multi-level support
- Advanced enemy behaviors
- Background customization

## Conclusion

The Mario Platformer Level Editor provides all the tools needed to create engaging, playable levels. Start with simple designs and gradually add complexity as you become more comfortable with the tools. Most importantly, have fun creating and testing your levels!

Remember: The best levels are those that are fun to play, not just impressive to look at. Focus on gameplay flow, fair challenges, and rewarding exploration.

Happy level building! 🎮✨