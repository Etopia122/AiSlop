class Physics {
    constructor() {
        this.gravity = 800; // Mario-like gravity
        this.terminalVelocity = 600;
        this.friction = 0.85;
        this.airFriction = 0.95;
    }

    applyGravity(gameObject, deltaTime) {
        if (!gameObject.grounded) {
            gameObject.velocity.y += this.gravity * deltaTime;
            
            // Apply terminal velocity
            if (gameObject.velocity.y > this.terminalVelocity) {
                gameObject.velocity.y = this.terminalVelocity;
            }
        }
    }

    applyFriction(gameObject) {
        const frictionValue = gameObject.grounded ? this.friction : this.airFriction;
        gameObject.velocity.x *= frictionValue;
    }

    checkCollision(rect1, rect2) {
        return rect1.left < rect2.right &&
               rect1.right > rect2.left &&
               rect1.top < rect2.bottom &&
               rect1.bottom > rect2.top;
    }

    // Advanced collision detection with response
    resolveCollision(obj1, obj2, deltaTime) {
        if (!this.checkCollision(obj1, obj2)) return null;

        const overlapX = Math.min(obj1.right - obj2.left, obj2.right - obj1.left);
        const overlapY = Math.min(obj1.bottom - obj2.top, obj2.bottom - obj1.top);

        let collision = {
            object1: obj1,
            object2: obj2,
            overlapX: overlapX,
            overlapY: overlapY,
            normal: Vector2.zero(),
            penetration: 0
        };

        // Determine collision normal and penetration
        if (overlapX < overlapY) {
            // Horizontal collision
            collision.penetration = overlapX;
            if (obj1.centerX < obj2.centerX) {
                collision.normal = Vector2.left();
            } else {
                collision.normal = Vector2.right();
            }
        } else {
            // Vertical collision
            collision.penetration = overlapY;
            if (obj1.centerY < obj2.centerY) {
                collision.normal = Vector2.up();
            } else {
                collision.normal = Vector2.down();
            }
        }

        // Separate objects
        this.separateObjects(collision);

        return collision;
    }

    separateObjects(collision) {
        const obj1 = collision.object1;
        const obj2 = collision.object2;
        const normal = collision.normal;
        const penetration = collision.penetration;

        // Calculate separation based on mass
        const totalMass = obj1.mass + obj2.mass;
        const separation1 = (obj2.mass / totalMass) * penetration;
        const separation2 = (obj1.mass / totalMass) * penetration;

        // Apply separation
        if (!obj1.hasTag('static')) {
            obj1.position.x -= normal.x * separation1;
            obj1.position.y -= normal.y * separation1;
        }

        if (!obj2.hasTag('static')) {
            obj2.position.x += normal.x * separation2;
            obj2.position.y += normal.y * separation2;
        }

        // Handle velocity changes
        this.resolveVelocity(collision);
    }

    resolveVelocity(collision) {
        const obj1 = collision.object1;
        const obj2 = collision.object2;
        const normal = collision.normal;

        // Calculate relative velocity
        const relativeVelocity = obj1.velocity.subtract(obj2.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);

        // Objects are separating
        if (velocityAlongNormal > 0) return;

        // Calculate restitution (bounciness)
        const restitution = Math.min(obj1.bounciness, obj2.bounciness);
        
        // Calculate impulse scalar
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
        if (normal.y < 0) { // Collision from above
            obj1.grounded = true;
            obj1.velocity.y = 0;
        } else if (normal.y > 0) { // Collision from below
            obj2.grounded = true;
            obj2.velocity.y = 0;
        }
    }

    // Mario-specific physics helpers
    applyJump(gameObject, jumpForce) {
        if (gameObject.grounded) {
            gameObject.velocity.y = -jumpForce;
            gameObject.grounded = false;
        }
    }

    applyHorizontalMovement(gameObject, direction, speed, deltaTime) {
        const acceleration = speed * 8; // Mario-like acceleration
        const maxSpeed = speed;
        
        if (direction !== 0) {
            gameObject.velocity.x += direction * acceleration * deltaTime;
            
            // Cap the speed
            if (Math.abs(gameObject.velocity.x) > maxSpeed) {
                gameObject.velocity.x = Math.sign(gameObject.velocity.x) * maxSpeed;
            }
            
            // Update facing direction
            gameObject.facingRight = direction > 0;
        }
    }

    // Check if object is on ground
    isGrounded(gameObject, tiles) {
        // Create a test rectangle slightly below the object
        const testRect = {
            left: gameObject.left,
            right: gameObject.right,
            top: gameObject.bottom,
            bottom: gameObject.bottom + 2
        };

        for (let tile of tiles) {
            if (tile.solid && this.checkCollision(testRect, tile)) {
                return true;
            }
        }

        return false;
    }

    // Mario-style stomp detection
    isStompingOn(stomper, target) {
        return stomper.bottom <= target.top + 10 && // Within stomp range
               stomper.velocity.y > 0 && // Falling down
               stomper.left < target.right &&
               stomper.right > target.left;
    }

    // Bounce effect for Mario stomping
    applyStompBounce(stomper, bounceForce = 300) {
        stomper.velocity.y = -bounceForce;
        stomper.grounded = false;
    }
}