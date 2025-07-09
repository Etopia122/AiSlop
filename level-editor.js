// Mario Platformer Level Editor
// Compatible with the Mario Platformer Engine

class LevelEditor {
    constructor() {
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Editor state
        this.camera = new Vector2(0, 0);
        this.zoom = 1;
        this.gridSize = 32;
        this.snapToGrid = true;
        this.showGrid = true;
        this.currentTool = null;
        this.brushSize = 1;
        this.isDragging = false;
        this.isPlacing = false;
        
        // Level data
        this.levelData = {
            name: "My Level",
            author: "Player",
            width: 100,
            height: 20,
            tiles: new Map(),
            entities: []
        };
        
        // History for undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // Layer visibility
        this.layers = {
            tiles: true,
            enemies: true,
            powerups: true,
            blocks: true
        };
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            gridX: 0,
            gridY: 0,
            down: false
        };
        
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupTools();
        this.setupEvents();
        this.loadSavedLevels();
        this.createInitialLevel();
        this.render();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.minimapCanvas.width = 230;
        this.minimapCanvas.height = 80;
        
        // Handle high DPI displays
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupTools() {
        // Define all available tools
        this.tools = {
            tiles: [
                { id: 'ground', name: 'Ground', color: '#8B4513', symbol: '█' },
                { id: 'brick', name: 'Brick', color: '#CD853F', symbol: '▣' },
                { id: 'stone', name: 'Stone', color: '#696969', symbol: '▦' },
                { id: 'ice', name: 'Ice', color: '#B0E0E6', symbol: '▢' },
                { id: 'lava', name: 'Lava', color: '#FF4500', symbol: '≈' },
                { id: 'water', name: 'Water', color: '#1E90FF', symbol: '~' },
                { id: 'cloud', name: 'Cloud', color: '#F0F8FF', symbol: '☁' },
                { id: 'platform', name: 'Platform', color: '#228B22', symbol: '─' }
            ],
            enemies: [
                { id: 'goomba', name: 'Goomba', color: '#8B4513', symbol: '👾' },
                { id: 'koopa', name: 'Koopa', color: '#32CD32', symbol: '🐢' },
                { id: 'enemy', name: 'Enemy', color: '#FF0000', symbol: '👹' }
            ],
            powerups: [
                { id: 'coin', name: 'Coin', color: '#FFD700', symbol: '🪙' },
                { id: 'mushroom', name: 'Mushroom', color: '#FF0000', symbol: '🍄' },
                { id: 'fireflower', name: 'Fire Flower', color: '#FF4500', symbol: '🌸' }
            ],
            blocks: [
                { id: 'question', name: 'Question Block', color: '#FFD700', symbol: '?' },
                { id: 'brick_block', name: 'Brick Block', color: '#CD853F', symbol: 'B' },
                { id: 'invisible', name: 'Invisible Block', color: '#E0E0E0', symbol: '□' },
                { id: 'pipe', name: 'Pipe', color: '#32CD32', symbol: '║' }
            ],
            tools: [
                { id: 'eraser', name: 'Eraser', color: '#FF0000', symbol: '🗑️' },
                { id: 'select', name: 'Select', color: '#0000FF', symbol: '📌' },
                { id: 'fill', name: 'Fill', color: '#800080', symbol: '🪣' },
                { id: 'player_start', name: 'Player Start', color: '#FF1493', symbol: '🚩' }
            ]
        };
        
        this.populateToolGrids();
    }
    
    populateToolGrids() {
        Object.keys(this.tools).forEach(category => {
            const grid = document.getElementById(category + 'Grid');
            if (!grid) return;
            
            this.tools[category].forEach(tool => {
                const item = document.createElement('div');
                item.className = 'tool-item';
                item.style.backgroundColor = tool.color;
                item.style.color = this.getContrastColor(tool.color);
                item.textContent = tool.symbol;
                item.title = tool.name;
                item.dataset.toolId = tool.id;
                item.dataset.category = category;
                
                if (tool.id === 'eraser') {
                    item.classList.add('eraser');
                }
                
                item.addEventListener('click', () => this.selectTool(tool, category));
                grid.appendChild(item);
            });
        });
    }
    
    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calculate brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
    
    selectTool(tool, category) {
        // Remove previous selection
        document.querySelectorAll('.tool-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select new tool
        const toolElement = document.querySelector(`[data-tool-id="${tool.id}"]`);
        if (toolElement) {
            toolElement.classList.add('selected');
        }
        
        this.currentTool = { ...tool, category };
        this.updateStatusBar();
    }
    
    setupEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // UI events
        document.getElementById('levelWidth').addEventListener('change', (e) => {
            this.levelData.width = parseInt(e.target.value);
            this.render();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }
    
    onMouseDown(e) {
        this.updateMousePosition(e);
        this.mouse.down = true;
        this.isDragging = false;
        this.isPlacing = true;
        
        if (e.button === 0) { // Left click
            this.placeTool();
        } else if (e.button === 2) { // Right click
            this.removeTool();
        }
    }
    
    onMouseMove(e) {
        this.updateMousePosition(e);
        
        if (this.mouse.down) {
            if (this.keys['Space'] || e.button === 1) { // Pan
                this.camera.x -= e.movementX / this.zoom;
                this.camera.y -= e.movementY / this.zoom;
                this.isDragging = true;
            } else if (this.isPlacing && (this.keys['Shift'] || this.brushSize > 1)) {
                this.placeTool();
            }
        }
        
        this.updateStatusBar();
        this.render();
    }
    
    onMouseUp(e) {
        this.mouse.down = false;
        this.isPlacing = false;
        
        if (!this.isDragging) {
            // Handle click events
        }
        
        this.isDragging = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const zoomFactor = 1.1;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX / this.zoom) + this.camera.x;
        const worldY = (mouseY / this.zoom) + this.camera.y;
        
        if (e.deltaY < 0) {
            this.zoom *= zoomFactor;
        } else {
            this.zoom /= zoomFactor;
        }
        
        this.zoom = Math.max(0.1, Math.min(5, this.zoom));
        
        this.camera.x = worldX - (mouseX / this.zoom);
        this.camera.y = worldY - (mouseY / this.zoom);
        
        this.render();
    }
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        
        // Handle shortcuts
        if (e.ctrlKey && e.code === 'KeyZ') {
            e.preventDefault();
            this.undo();
        } else if (e.ctrlKey && e.code === 'KeyY') {
            e.preventDefault();
            this.redo();
        } else if (e.code === 'Delete') {
            this.removeTool();
        }
        
        // Arrow key panning
        const panSpeed = 10;
        if (e.code === 'ArrowLeft') this.camera.x -= panSpeed;
        if (e.code === 'ArrowRight') this.camera.x += panSpeed;
        if (e.code === 'ArrowUp') this.camera.y -= panSpeed;
        if (e.code === 'ArrowDown') this.camera.y += panSpeed;
        
        this.render();
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        // Convert to world coordinates
        this.mouse.worldX = (this.mouse.x / this.zoom) + this.camera.x;
        this.mouse.worldY = (this.mouse.y / this.zoom) + this.camera.y;
        
        // Snap to grid
        if (this.snapToGrid) {
            this.mouse.gridX = Math.floor(this.mouse.worldX / this.gridSize) * this.gridSize;
            this.mouse.gridY = Math.floor(this.mouse.worldY / this.gridSize) * this.gridSize;
        } else {
            this.mouse.gridX = this.mouse.worldX;
            this.mouse.gridY = this.mouse.worldY;
        }
    }
    
    placeTool() {
        if (!this.currentTool) return;
        
        const brushSize = parseInt(document.getElementById('brushSize').value);
        
        for (let x = 0; x < brushSize; x++) {
            for (let y = 0; y < brushSize; y++) {
                const gridX = Math.floor(this.mouse.gridX / this.gridSize) + x;
                const gridY = Math.floor(this.mouse.gridY / this.gridSize) + y;
                
                if (this.currentTool.id === 'eraser') {
                    this.removeAt(gridX, gridY);
                } else {
                    this.placeAt(gridX, gridY, this.currentTool);
                }
            }
        }
        
        this.render();
    }
    
    removeTool() {
        if (!this.currentTool) return;
        
        const gridX = Math.floor(this.mouse.gridX / this.gridSize);
        const gridY = Math.floor(this.mouse.gridY / this.gridSize);
        
        this.removeAt(gridX, gridY);
        this.render();
    }
    
    placeAt(gridX, gridY, tool) {
        const key = `${gridX},${gridY}`;
        
        if (tool.category === 'tiles') {
            this.levelData.tiles.set(key, {
                type: tool.id,
                x: gridX,
                y: gridY
            });
        } else {
            // Remove existing entity at this position
            this.levelData.entities = this.levelData.entities.filter(entity => 
                !(entity.x === gridX && entity.y === gridY)
            );
            
            // Add new entity
            this.levelData.entities.push({
                type: tool.id,
                category: tool.category,
                x: gridX,
                y: gridY
            });
        }
        
        this.saveState();
    }
    
    removeAt(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        
        // Remove tile
        this.levelData.tiles.delete(key);
        
        // Remove entities
        this.levelData.entities = this.levelData.entities.filter(entity => 
            !(entity.x === gridX && entity.y === gridY)
        );
        
        this.saveState();
    }
    
    saveState() {
        // Save current state for undo/redo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(this.serializeLevelData());
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadLevelData(JSON.parse(this.history[this.historyIndex]));
            this.render();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadLevelData(JSON.parse(this.history[this.historyIndex]));
            this.render();
        }
    }
    
    createInitialLevel() {
        // Create some ground
        for (let x = 0; x < 20; x++) {
            this.levelData.tiles.set(`${x},18`, {
                type: 'ground',
                x: x,
                y: 18
            });
        }
        
        this.saveState();
    }
    
    render() {
        this.ctx.fillStyle = '#5C94FC'; // Sky blue
        this.ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        
        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render grid
        if (this.showGrid) {
            this.renderGrid();
        }
        
        // Render tiles
        if (this.layers.tiles) {
            this.renderTiles();
        }
        
        // Render entities
        if (this.layers.enemies || this.layers.powerups || this.layers.blocks) {
            this.renderEntities();
        }
        
        // Render cursor
        this.renderCursor();
        
        this.ctx.restore();
        
        // Render minimap
        this.renderMinimap();
        
        this.updateStatusBar();
    }
    
    renderGrid() {
        const startX = Math.floor(this.camera.x / this.gridSize) * this.gridSize;
        const endX = startX + (this.canvas.clientWidth / this.zoom) + this.gridSize;
        const startY = Math.floor(this.camera.y / this.gridSize) * this.gridSize;
        const endY = startY + (this.canvas.clientHeight / this.zoom) + this.gridSize;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }
    
    renderTiles() {
        for (const [key, tile] of this.levelData.tiles) {
            const tool = this.tools.tiles.find(t => t.id === tile.type);
            if (!tool) continue;
            
            const x = tile.x * this.gridSize;
            const y = tile.y * this.gridSize;
            
            this.ctx.fillStyle = tool.color;
            this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
            
            // Draw symbol
            this.ctx.fillStyle = this.getContrastColor(tool.color);
            this.ctx.font = `${this.gridSize * 0.6}px Courier New`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                tool.symbol,
                x + this.gridSize / 2,
                y + this.gridSize / 2
            );
        }
    }
    
    renderEntities() {
        for (const entity of this.levelData.entities) {
            if (!this.layers[entity.category]) continue;
            
            const tool = this.tools[entity.category]?.find(t => t.id === entity.type);
            if (!tool) continue;
            
            const x = entity.x * this.gridSize;
            const y = entity.y * this.gridSize;
            
            this.ctx.fillStyle = tool.color;
            this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
            
            // Draw symbol
            this.ctx.fillStyle = this.getContrastColor(tool.color);
            this.ctx.font = `${this.gridSize * 0.6}px Courier New`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                tool.symbol,
                x + this.gridSize / 2,
                y + this.gridSize / 2
            );
        }
    }
    
    renderCursor() {
        if (!this.currentTool) return;
        
        const brushSize = parseInt(document.getElementById('brushSize').value);
        const alpha = this.mouse.down ? 0.7 : 0.3;
        
        for (let x = 0; x < brushSize; x++) {
            for (let y = 0; y < brushSize; y++) {
                const gridX = Math.floor(this.mouse.gridX / this.gridSize) + x;
                const gridY = Math.floor(this.mouse.gridY / this.gridSize) + y;
                
                const px = gridX * this.gridSize;
                const py = gridY * this.gridSize;
                
                this.ctx.fillStyle = this.currentTool.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                this.ctx.fillRect(px, py, this.gridSize, this.gridSize);
                
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(px, py, this.gridSize, this.gridSize);
            }
        }
    }
    
    renderMinimap() {
        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        
        ctx.fillStyle = '#5C94FC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scaleX = canvas.width / (this.levelData.width * this.gridSize);
        const scaleY = canvas.height / (this.levelData.height * this.gridSize);
        const scale = Math.min(scaleX, scaleY);
        
        ctx.save();
        ctx.scale(scale, scale);
        
        // Render tiles on minimap
        for (const [key, tile] of this.levelData.tiles) {
            const tool = this.tools.tiles.find(t => t.id === tile.type);
            if (!tool) continue;
            
            ctx.fillStyle = tool.color;
            ctx.fillRect(
                tile.x * this.gridSize,
                tile.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        }
        
        // Render entities on minimap
        for (const entity of this.levelData.entities) {
            const tool = this.tools[entity.category]?.find(t => t.id === entity.type);
            if (!tool) continue;
            
            ctx.fillStyle = tool.color;
            ctx.fillRect(
                entity.x * this.gridSize,
                entity.y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        }
        
        ctx.restore();
        
        // Draw viewport indicator
        const viewX = (this.camera.x * scale);
        const viewY = (this.camera.y * scale);
        const viewW = (this.canvas.clientWidth / this.zoom) * scale;
        const viewH = (this.canvas.clientHeight / this.zoom) * scale;
        
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(viewX, viewY, viewW, viewH);
    }
    
    updateStatusBar() {
        const gridX = Math.floor(this.mouse.gridX / this.gridSize);
        const gridY = Math.floor(this.mouse.gridY / this.gridSize);
        const objectCount = this.levelData.tiles.size + this.levelData.entities.length;
        const toolName = this.currentTool ? this.currentTool.name : 'None';
        
        document.getElementById('statusBar').textContent = 
            `Position: (${gridX}, ${gridY}) | Tool: ${toolName} | Objects: ${objectCount}`;
    }
    
    serializeLevelData() {
        return JSON.stringify({
            ...this.levelData,
            tiles: Array.from(this.levelData.tiles.entries())
        });
    }
    
    loadLevelData(data) {
        this.levelData = {
            ...data,
            tiles: new Map(data.tiles)
        };
    }
    
    exportLevel() {
        const exportData = {
            name: document.getElementById('levelName').value,
            author: document.getElementById('levelAuthor').value,
            width: this.levelData.width,
            height: this.levelData.height,
            tiles: [],
            entities: []
        };
        
        // Convert tiles to engine format
        for (const [key, tile] of this.levelData.tiles) {
            exportData.tiles.push({
                type: tile.type,
                x: tile.x * 32, // Convert to pixel coordinates
                y: tile.y * 32,
                width: 32,
                height: 32
            });
        }
        
        // Convert entities to engine format
        for (const entity of this.levelData.entities) {
            exportData.entities.push({
                type: entity.type,
                category: entity.category,
                x: entity.x * 32,
                y: entity.y * 32
            });
        }
        
        return JSON.stringify(exportData, null, 2);
    }
    
    importLevel(data) {
        try {
            const levelData = JSON.parse(data);
            
            // Clear current level
            this.levelData.tiles.clear();
            this.levelData.entities = [];
            
            // Set level properties
            this.levelData.name = levelData.name || "Imported Level";
            this.levelData.width = levelData.width || 100;
            this.levelData.height = levelData.height || 20;
            
            document.getElementById('levelName').value = this.levelData.name;
            document.getElementById('levelAuthor').value = levelData.author || "Unknown";
            
            // Import tiles
            if (levelData.tiles) {
                for (const tile of levelData.tiles) {
                    const gridX = Math.floor(tile.x / 32);
                    const gridY = Math.floor(tile.y / 32);
                    this.levelData.tiles.set(`${gridX},${gridY}`, {
                        type: tile.type,
                        x: gridX,
                        y: gridY
                    });
                }
            }
            
            // Import entities
            if (levelData.entities) {
                for (const entity of levelData.entities) {
                    const gridX = Math.floor(entity.x / 32);
                    const gridY = Math.floor(entity.y / 32);
                    this.levelData.entities.push({
                        type: entity.type,
                        category: entity.category,
                        x: gridX,
                        y: gridY
                    });
                }
            }
            
            this.saveState();
            this.render();
            return true;
        } catch (error) {
            console.error('Failed to import level:', error);
            return false;
        }
    }
    
    loadSavedLevels() {
        const savedLevels = JSON.parse(localStorage.getItem('mario_editor_levels') || '{}');
        const select = document.getElementById('savedLevels');
        
        // Clear existing options
        select.innerHTML = '<option value="">Select Level...</option>';
        
        // Add saved levels
        Object.keys(savedLevels).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }
}

// Global editor instance
let editor;

// Global functions for UI
function clearLevel() {
    if (confirm('Are you sure you want to clear the entire level?')) {
        editor.levelData.tiles.clear();
        editor.levelData.entities = [];
        editor.saveState();
        editor.render();
    }
}

function testLevel() {
    const levelData = editor.exportLevel();
    localStorage.setItem('mario_test_level', levelData);
    window.open('index.html?test=true', '_blank');
}

function showExportModal() {
    const modal = document.getElementById('exportModal');
    const exportData = document.getElementById('exportData');
    exportData.value = editor.exportLevel();
    modal.style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function showImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
}

function copyToClipboard() {
    const exportData = document.getElementById('exportData');
    exportData.select();
    document.execCommand('copy');
    alert('Level data copied to clipboard!');
}

function downloadLevel() {
    const levelName = document.getElementById('levelName').value || 'level';
    const data = editor.exportLevel();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${levelName}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function importLevel() {
    const data = document.getElementById('importData').value;
    if (editor.importLevel(data)) {
        alert('Level imported successfully!');
        closeImportModal();
    } else {
        alert('Failed to import level. Please check the JSON format.');
    }
}

function loadFile() {
    const file = document.getElementById('fileInput').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('importData').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

function saveLevel() {
    const levelName = document.getElementById('levelName').value || 'Untitled';
    const savedLevels = JSON.parse(localStorage.getItem('mario_editor_levels') || '{}');
    
    savedLevels[levelName] = editor.serializeLevelData();
    localStorage.setItem('mario_editor_levels', JSON.stringify(savedLevels));
    
    editor.loadSavedLevels();
    alert(`Level "${levelName}" saved!`);
}

function loadSavedLevel() {
    const select = document.getElementById('savedLevels');
    const levelName = select.value;
    
    if (!levelName) return;
    
    const savedLevels = JSON.parse(localStorage.getItem('mario_editor_levels') || '{}');
    const levelData = savedLevels[levelName];
    
    if (levelData) {
        editor.loadLevelData(JSON.parse(levelData));
        document.getElementById('levelName').value = editor.levelData.name;
        document.getElementById('levelAuthor').value = editor.levelData.author || 'Unknown';
        editor.render();
    }
}

function deleteSavedLevel() {
    const select = document.getElementById('savedLevels');
    const levelName = select.value;
    
    if (!levelName) return;
    
    if (confirm(`Are you sure you want to delete "${levelName}"?`)) {
        const savedLevels = JSON.parse(localStorage.getItem('mario_editor_levels') || '{}');
        delete savedLevels[levelName];
        localStorage.setItem('mario_editor_levels', JSON.stringify(savedLevels));
        
        editor.loadSavedLevels();
        alert(`Level "${levelName}" deleted!`);
    }
}

function updateGridSize() {
    editor.gridSize = parseInt(document.getElementById('gridSize').value);
    editor.render();
}

function updateLayerVisibility() {
    editor.layers.tiles = document.getElementById('showTiles').checked;
    editor.layers.enemies = document.getElementById('showEnemies').checked;
    editor.layers.powerups = document.getElementById('showPowerups').checked;
    editor.layers.blocks = document.getElementById('showBlocks').checked;
    editor.render();
}

function updateGridVisibility() {
    editor.showGrid = document.getElementById('showGrid').checked;
    editor.render();
}

// Initialize editor when page loads
window.addEventListener('load', () => {
    editor = new LevelEditor();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const exportModal = document.getElementById('exportModal');
    const importModal = document.getElementById('importModal');
    
    if (e.target === exportModal) {
        closeExportModal();
    }
    if (e.target === importModal) {
        closeImportModal();
    }
});