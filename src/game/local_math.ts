import {Vector} from "../ecw/vector";
import {world} from "./create_world";
import {CardVariant, OnBoard} from "./components";
import type {Entity} from "../ecw/entity";

export const v = (x, y) => new Vector(x, y)

export const from_v = (vec: Vector|Array<number>) => {
    vec = Vector.ensure(vec)
    return vec.y * 3 + vec.x
}

export const to_v = (key: number) => {
    return new Vector(
        key % 3,
        Math.floor(key / 3)
    )
}

export const select = (filters=undefined, pattern=undefined) => {
    let candidates = []
    if (pattern === undefined) {
        candidates = world.q(OnBoard)
    } else {
        for (let pos of pattern) {
            const candidate = world.qo(new OnBoard(from_v(pos)))
            if (candidate)
                candidates.push(candidate)
        }
    }


    if (filters && filters.length > 0) {
        candidates = candidates.filter(ent => {
            for (let obj of filters)
                if (obj.apply(ent)) return true
            return false
        })
    }
    return candidates
}

export const as_pattern = (ents: Entity[]) => {
    return ents.map(ent => ent.get(OnBoard))
}

export const relative = (ent: Entity, filter, pattern) => {
    const pos = to_v(ent.get(OnBoard))

    const targets = []
    for (let p of pattern) {
        const vector_grid = pos.copy().add(p)
        if (vector_grid.x > 2 || vector_grid.x < 0) continue
        if (vector_grid.y > 3 || vector_grid.y < 0) continue

        const pos_target = from_v(vector_grid)

        const target = world.qo(new OnBoard(pos_target), ...filter)
        if (target === undefined) continue
        targets.push(target)
    }
    return targets
}

export const pattern_around = [[0, 0],[0, 1], [0, -1], [1, 0], [-1, 0]]
export const pattern_row = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]]
export const pattern_col = [
    [0, 2], [0, 1],
    [0, 0],
    [0, -1], [0, -2]
]

export const pattern_chess = [
    [1, 2],
    [2, 1],[0, 1],
    [1, 0],
]

export const pattern_closest = [
    [0, 0], [1, 0], [2, 0]
]
export const pattern_farthest = [
    [0, 2], [1, 2], [2, 2]
]