export interface IPoint {
    x: number,
    y: number
}

export class VectorImmutable {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    static new(x: number, y: number) {
        return new Vector(x, y)
    }

    static fromPoint(point: IPoint) {
        return new Vector(point.x, point.y)
    }

    get length() {
        return Number(
            Math.sqrt(this.x ** 2 + this.y ** 2).toFixed(5)
        )
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    normalized() {
        const mag = this.length
        if (mag === 0) return new Vector(0, 0)

        return new Vector(this.x / mag, this.y / mag)
    }

    inverted() {
        return new Vector(-this.x, -this.y)
    }

    perpendicular() {
        return new Vector(this.y, -this.x)
    }

    rotate(angle: number) {
        return new Vector(
            this.x * Math.cos(angle) - this.y * Math.sin(angle),
            this.x * Math.sin(angle) + this.y * Math.cos(angle)
        );
    }

    set (vec: IPoint) {
        this.x = vec.x
        this.y = vec.y
        return this
    }

    addVectorMut(vec: IPoint) {
        this.x += vec.x
        this.y += vec.y
        return this
    }

    subVectorMut(vec: IPoint) {
        this.x -= vec.x
        this.y -= vec.y
        return this
    }

    addVector(vec: IPoint) {
        return new Vector(this.x + vec.x, this.y + vec.y)
    }

    subVector(vec: IPoint) {
        return new Vector(this.x - vec.x, this.y - vec.y)
    }

    mul(n: number) {
        return new Vector(this.x * n, this.y * n)
    }

    div(n: number) {
        return new Vector(this.x / n, this.y / n)
    }

    dot(vec: IPoint) {
        return this.x * vec.x + this.y * vec.y
    }

    angleBetween(vec: IPoint) {
        const modOfVector = Math.sqrt(this.x ** 2 + this.y ** 2) * Math.sqrt(vec.x ** 2 + vec.y ** 2)
        return Math.acos(this.dot(vec) / modOfVector)
    }

    copy() {
        return new Vector(this.x, this.y)
    }
}

export class Vector {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    static get ZERO() {
        return new Vector(0, 0)
    }

    static new(x: number, y: number) {
        return new Vector(x, y)
    }

    static ensure(arg) {
        if (arg instanceof Vector)
            return arg
        if (Array.isArray(arg))
            return new Vector(arg[0], arg[1])
        return Vector.fromPoint(arg)
    }

    static fromPoint(point: IPoint) {
        return new Vector(point.x, point.y)
    }
    get length() {
        return Number(
            Math.sqrt(this.x ** 2 + this.y ** 2).toFixed(5)
        )
    }

    angle() {
        return Math.atan2(this.y, this.x) + Math.PI
    }

    copyFrom(point: IPoint) {
        this.x = point.x
        this.y = point.y
        return this
    }

    set(x: number, y: number) {
        this.x = x
        this.y = y
    }


    normalize() {
        const mag = this.length
        if (mag === 0) return this

        this.x /= mag
        this.y /= mag
        return this
    }

    inverse() {
        this.x = -this.x
        this.y = -this.y
        return this
    }


    rotate(angle: number) {
        const x = this.x * Math.cos(angle) - this.y * Math.sin(angle)
        this.y = this.x * Math.sin(angle) + this.y * Math.cos(angle)
        this.x = x
        return this
    }

    add(vec: IPoint | number[]) {
        if ("x" in vec && "y" in vec ) {
            this.x += vec.x
            this.y += vec.y
        } else {
            this.x += vec[0]
            this.y += vec[1]
        }
        return this
    }

    sub(vec: IPoint) {
        this.x -= vec.x
        this.y -= vec.y
        return this
    }

    mulScalar(n: number) {
        this.x *= n
        this.y *= n
        return this
    }

    divScalar(n: number) {
        this.x /= n
        this.y /= n
        return this
    }

    clampLength(n: number) {
        if (this.length > n)
            this.normalize().mulScalar(n)
        return this
    }

    copy() {
        return new Vector(this.x, this.y)
    }
}

export const distance_between = (a: Vector, b: Vector) : number => {
    return  a.copy().sub(b).length
}

export const direction_to = (from: Vector, to: Vector): Vector => {
    return to.copy().sub(from).normalize()
}