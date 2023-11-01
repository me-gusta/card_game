import type {IPoint} from "../ecw/vector";
import {Vector} from "../ecw/vector";

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomFloat(min: number = 0, max: number = 1) {
    return Math.random() * (max - min) + min
}

export function round (x: number, n=2) {
    const mul = 10 ** n
    return Math.round((x + Number.EPSILON) * mul) / mul
}

export function randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = (Object.values(anEnum) as unknown) as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
}

export function randomFromArray(items: any[]) {
    return items[Math.floor(Math.random() * items.length)]
}

function interpolate(pBegin: number, pEnd: number, pStep: number, pMax: number) {
    if (pBegin < pEnd) {
        return (pEnd - pBegin) * (pStep / pMax) + pBegin
    } else {
        return (pBegin - pEnd) * (1 - pStep / pMax) + pEnd
    }
}

export function gradient(myColor0: number, myColor1: number, i: number) {
    const r0 = (myColor0 & 0xff0000) >> 16
    const g0 = (myColor0 & 0x00ff00) >> 8
    const b0 = (myColor0 & 0x0000ff) >> 0

    const r1 = (myColor1 & 0xff0000) >> 16
    const g1 = (myColor1 & 0x00ff00) >> 8
    const b1 = (myColor1 & 0x0000ff) >> 0

    const max = 1
    const r = interpolate(r1, r0, i, max)
    const g = interpolate(g1, g0, i, max)
    const b = interpolate(b1, b0, i, max)

    return (((r << 8) | g) << 8) | b
}

export const lerp = (x1: number, x2: number, a: number) => x1 * (1 - a) + x2 * a
export const clamp = (min: number, max: number, a: number) => Math.max(min, Math.min(a, max))

export function div(val, by) {
    return (val - val % by) / by;
}

export const calc_tile_id = (x: number | IPoint, y?: number) => {
    if ((x as IPoint).x)
        return (x as IPoint).x * 10 + (x as IPoint).y

    return (x as number) * 10 + y
}


export function deg2rad(degrees) {
    let pi = Math.PI;
    return degrees * (pi / 180);
}

export function rad2deg(radians) {
    let pi = Math.PI;
    return radians / (pi / 180);
}

export function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export const random_point_in_circle = (center: IPoint, radius: number): Vector => {
    const r = radius * Math.sqrt(getRandomFloat())
    const theta = getRandomFloat() * 2 * Math.PI
    // console.log(theta, Math.cos(theta), Math.sin(theta))
    return Vector.new(
        center.x + r * Math.cos(theta),
        center.y + r * Math.sin(theta)
    )
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

export function in_array(arr, item) {
    return arr.indexOf(item) !== -1
}

export function pick_n_random (n, arr) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, n)
}

export function getRandomChoice (arr) {
    return arr[getRandomInt(0, arr.length - 1)]
}

export function* range(start, stop=undefined) {
    if (stop === undefined) {
        stop = start
        start = 0
    }
    for (let n = start; n < stop; ++n) yield n;
}
