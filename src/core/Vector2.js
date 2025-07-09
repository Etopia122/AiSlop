class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Static methods
    static zero() {
        return new Vector2(0, 0);
    }

    static one() {
        return new Vector2(1, 1);
    }

    static up() {
        return new Vector2(0, -1);
    }

    static down() {
        return new Vector2(0, 1);
    }

    static left() {
        return new Vector2(-1, 0);
    }

    static right() {
        return new Vector2(1, 0);
    }

    // Instance methods
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized() {
        const mag = this.magnitude();
        if (mag === 0) return Vector2.zero();
        return this.divide(mag);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    distance(other) {
        return this.subtract(other).magnitude();
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
}