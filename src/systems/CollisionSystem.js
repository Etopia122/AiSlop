class CollisionSystem {
    constructor() {
        this.collisionPairs = [];
        this.spatialGrid = new Map();
        this.gridSize = 64;
    }

    // Update collision system
    update(gameObjects, deltaTime) {
        // Clear previous collision pairs
        this.collisionPairs = [];
        
        // Build spatial grid for optimization
        this.buildSpatialGrid(gameObjects);
        
        // Check collisions
        this.checkCollisions(gameObjects, deltaTime);
        
        // Process collision responses
        this.processCollisionResponses(deltaTime);
    }

    // Build spatial grid for collision optimization
    buildSpatialGrid(gameObjects) {
        this.spatialGrid.clear();
        
        gameObjects.forEach(obj => {
            if (!obj.active || !obj.solid) return;
            
            const gridX = Math.floor(obj.position.x / this.gridSize);
            const gridY = Math.floor(obj.position.y / this.gridSize);
            const key = `${gridX},${gridY}`;
            
            if (!this.spatialGrid.has(key)) {
                this.spatialGrid.set(key, []);
            }
            
            this.spatialGrid.get(key).push(obj);
        });
    }

    // Check collisions between game objects
    checkCollisions(gameObjects, deltaTime) {
        const dynamicObjects = gameObjects.filter(obj => 
            obj.active && !obj.hasTag('static') && obj.velocity.magnitude() > 0
        );
        
        dynamicObjects.forEach(obj => {
            // Get nearby objects from spatial grid
            const nearbyObjects = this.getNearbyObjects(obj);
            
            nearbyObjects.forEach(other => {
                if (obj === other || !other.active) return;
                
                // Check if objects intersect
                if (this.checkIntersection(obj, other)) {
                    const collision = this.createCollisionInfo(obj, other);
                    this.collisionPairs.push(collision);
                }
            });
            
            // Check specific collision types
            this.checkPlayerCollisions(obj, gameObjects);
            this.checkEnemyCollisions(obj, gameObjects);
            this.checkProjectileCollisions(obj, gameObjects);
        });
    }

    // Get nearby objects from spatial grid
    getNearbyObjects(obj) {
        const nearby = [];
        const gridX = Math.floor(obj.position.x / this.gridSize);
        const gridY = Math.floor(obj.position.y / this.gridSize);
        
        // Check surrounding grid cells
        for (let x = gridX - 1; x <= gridX + 1; x++) {
            for (let y = gridY - 1; y <= gridY + 1; y++) {
                const key = `${x},${y}`;
                const objects = this.spatialGrid.get(key);
                
                if (objects) {
                    nearby.push(...objects);
                }
            }
        }
        
        return nearby;
    }

    // Check if two objects intersect
    checkIntersection(obj1, obj2) {
        return obj1.left < obj2.right &&
               obj1.right > obj2.left &&
               obj1.top < obj2.bottom &&
               obj1.bottom > obj2.top;
    }

    // Create collision information
    createCollisionInfo(obj1, obj2) {
        const overlapX = Math.min(obj1.right - obj2.left, obj2.right - obj1.left);
        const overlapY = Math.min(obj1.bottom - obj2.top, obj2.bottom - obj1.top);
        
        let normal = Vector2.zero();
        let penetration = 0;
        
        // Determine collision normal
        if (overlapX < overlapY) {
            // Horizontal collision
            penetration = overlapX;
            normal = obj1.centerX < obj2.centerX ? Vector2.left() : Vector2.right();
        } else {
            // Vertical collision
            penetration = overlapY;
            normal = obj1.centerY < obj2.centerY ? Vector2.up() : Vector2.down();
        }
        
        return {
            obj1: obj1,
            obj2: obj2,
            normal: normal,
            penetration: penetration,
            overlapX: overlapX,
            overlapY: overlapY
        };
    }

    // Check player-specific collisions
    checkPlayerCollisions(player, gameObjects) {
        if (!player.hasTag('player')) return;
        
        gameObjects.forEach(obj => {
            if (obj === player || !obj.active) return;
            
            if (this.checkIntersection(player, obj)) {
                // Player vs Enemy
                if (obj.hasTag('enemy')) {
                    this.handlePlayerEnemyCollision(player, obj);
                }
                
                // Player vs Power-up
                if (obj.hasTag('powerup')) {
                    this.handlePlayerPowerUpCollision(player, obj);
                }
                
                // Player vs Coin
                if (obj.hasTag('coin')) {
                    this.handlePlayerCoinCollision(player, obj);
                }
                
                // Player vs Block
                if (obj.hasTag('block')) {
                    this.handlePlayerBlockCollision(player, obj);
                }
            }
        });
    }

    // Check enemy-specific collisions
    checkEnemyCollisions(enemy, gameObjects) {
        if (!enemy.hasTag('enemy')) return;
        
        gameObjects.forEach(obj => {
            if (obj === enemy || !obj.active) return;
            
            if (this.checkIntersection(enemy, obj)) {
                // Enemy vs Fireball
                if (obj.hasTag('fireball')) {
                    this.handleEnemyFireballCollision(enemy, obj);
                }
                
                // Enemy vs Enemy (for shell mechanics)
                if (obj.hasTag('enemy')) {
                    this.handleEnemyEnemyCollision(enemy, obj);
                }
            }
        });
    }

    // Check projectile collisions
    checkProjectileCollisions(projectile, gameObjects) {
        if (!projectile.hasTag('projectile')) return;
        
        gameObjects.forEach(obj => {
            if (obj === projectile || !obj.active) return;
            
            if (this.checkIntersection(projectile, obj)) {
                // Projectile vs Block
                if (obj.hasTag('block') && obj.solid) {
                    this.handleProjectileBlockCollision(projectile, obj);
                }
                
                // Projectile vs Enemy
                if (obj.hasTag('enemy')) {
                    this.handleProjectileEnemyCollision(projectile, obj);
                }
            }
        });
    }

    // Collision response handlers
    handlePlayerEnemyCollision(player, enemy) {
        // Check if player is stomping on enemy
        if (player.velocity.y > 0 && player.bottom <= enemy.top + 8) {
            // Player stomps enemy
            this.handleEnemyStomp(player, enemy);
        } else {
            // Player takes damage
            this.handlePlayerDamage(player, enemy);
        }
    }

    handlePlayerPowerUpCollision(player, powerup) {
        // Apply power-up effect
        if (powerup.hasTag('mushroom')) {
            player.powerUp('big');
        } else if (powerup.hasTag('fire_flower')) {
            player.powerUp('fire');
        }
        
        // Remove power-up
        powerup.destroy();
        
        // Play sound and add score
        if (player.engine && player.engine.audio) {
            player.engine.audio.playPowerUpSound();
        }
        
        if (player.engine) {
            player.engine.addScore(1000);
        }
    }

    handlePlayerCoinCollision(player, coin) {
        // Remove coin
        coin.destroy();
        
        // Play sound and add score
        if (player.engine && player.engine.audio) {
            player.engine.audio.playCoinSound();
        }
        
        if (player.engine) {
            player.engine.addScore(200);
        }
    }

    handlePlayerBlockCollision(player, block) {
        const collision = this.createCollisionInfo(player, block);
        
        // Handle block hitting from below
        if (collision.normal.y > 0 && player.velocity.y < 0) {
            if (block.hasTag('question_block') && !block.empty) {
                block.activate(player);
            } else if (block.hasTag('brick_block') && player.canBreakBlocks) {
                block.break(player);
            }
        }
        
        // Resolve collision
        this.resolveCollision(collision);
    }

    handleEnemyFireballCollision(enemy, fireball) {
        // Destroy fireball
        fireball.destroy();
        
        // Damage enemy
        enemy.takeDamage(1);
        
        // Play sound
        if (enemy.engine && enemy.engine.audio) {
            enemy.engine.audio.playEnemyDeathSound();
        }
        
        // Add score
        if (enemy.engine) {
            enemy.engine.addScore(100);
        }
    }

    handleEnemyEnemyCollision(enemy1, enemy2) {
        // Handle shell hitting enemy
        if (enemy1.hasTag('shell') && enemy1.spinning) {
            enemy2.takeDamage(1);
        } else if (enemy2.hasTag('shell') && enemy2.spinning) {
            enemy1.takeDamage(1);
        } else {
            // Normal enemy collision - reverse directions
            enemy1.velocity.x *= -1;
            enemy2.velocity.x *= -1;
            enemy1.facingRight = !enemy1.facingRight;
            enemy2.facingRight = !enemy2.facingRight;
        }
    }

    handleProjectileBlockCollision(projectile, block) {
        projectile.destroy();
        
        // Create visual effect
        this.createImpactEffect(projectile.position.x, projectile.position.y);
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.destroy();
        enemy.takeDamage(1);
        
        // Play sound and add score
        if (enemy.engine && enemy.engine.audio) {
            enemy.engine.audio.playEnemyDeathSound();
        }
        
        if (enemy.engine) {
            enemy.engine.addScore(100);
        }
    }

    handleEnemyStomp(player, enemy) {
        // Apply stomp bounce to player
        player.velocity.y = -300;
        player.grounded = false;
        
        // Damage enemy
        enemy.takeDamage(1);
        
        // Play sound and add score
        if (player.engine && player.engine.audio) {
            player.engine.audio.playEnemyDeathSound();
        }
        
        if (player.engine) {
            player.engine.addScore(100);
        }
    }

    handlePlayerDamage(player, enemy) {
        // Check if player is invincible
        if (player.invincible) return;
        
        // Apply damage
        player.takeDamage(1);
        
        // Knockback
        const knockbackDirection = player.position.x < enemy.position.x ? -1 : 1;
        player.velocity.x = knockbackDirection * 200;
        player.velocity.y = -150;
        
        // Make player temporarily invincible
        player.makeInvincible(2.0);
    }

    // Process all collision responses
    processCollisionResponses(deltaTime) {
        this.collisionPairs.forEach(collision => {
            // Only resolve solid collisions
            if (collision.obj1.solid && collision.obj2.solid) {
                this.resolveCollision(collision);
            }
        });
    }

    // Resolve collision between two objects
    resolveCollision(collision) {
        const obj1 = collision.obj1;
        const obj2 = collision.obj2;
        const normal = collision.normal;
        const penetration = collision.penetration;
        
        // Calculate masses
        const totalMass = obj1.mass + obj2.mass;
        const separation1 = obj2.hasTag('static') ? penetration : (obj2.mass / totalMass) * penetration;
        const separation2 = obj1.hasTag('static') ? penetration : (obj1.mass / totalMass) * penetration;
        
        // Separate objects
        if (!obj1.hasTag('static')) {
            obj1.position.x -= normal.x * separation1;
            obj1.position.y -= normal.y * separation1;
        }
        
        if (!obj2.hasTag('static')) {
            obj2.position.x += normal.x * separation2;
            obj2.position.y += normal.y * separation2;
        }
        
        // Handle velocity changes
        const relativeVelocity = obj1.velocity.subtract(obj2.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);
        
        if (velocityAlongNormal > 0) return; // Objects separating
        
        // Calculate restitution
        const restitution = Math.min(obj1.bounciness, obj2.bounciness);
        
        // Calculate impulse
        let impulse = -(1 + restitution) * velocityAlongNormal;
        impulse /= (1 / obj1.mass + 1 / obj2.mass);
        
        // Apply impulse
        const impulseVector = normal.multiply(impulse);
        
        if (!obj1.hasTag('static')) {
            obj1.velocity = obj1.velocity.add(impulseVector.multiply(1 / obj1.mass));
        }
        
        if (!obj2.hasTag('static')) {
            obj2.velocity = obj2.velocity.subtract(impulseVector.multiply(1 / obj2.mass));
        }
        
        // Handle grounding
        if (normal.y < 0) {
            obj1.grounded = true;
            obj1.velocity.y = 0;
        } else if (normal.y > 0) {
            obj2.grounded = true;
            obj2.velocity.y = 0;
        }
    }

    // Create visual effect for impacts
    createImpactEffect(x, y) {
        // This could create particle effects or other visual feedback
        // For now, just log the impact
        console.log(`Impact at ${x}, ${y}`);
    }

    // Clear collision system
    clear() {
        this.collisionPairs = [];
        this.spatialGrid.clear();
    }
}