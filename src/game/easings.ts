export function easeInCubic(x: number): number {
    return x * x * x;

}

export function easeInSine(x: number): number {
    return 1 - Math.cos((x * Math.PI) / 2);

}

export function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);

}