import {Vector} from "../esc/vector";
import anime from "animejs/lib/anime.es.js";
import {extract_digits} from "./helpers";

let is_moving = false
let pos_touch_start = null

const offset_max = 50
let offset = Vector.ZERO

const get_pos = (e) => Vector.new(e.touches[0].pageX, e.touches[0].pageY)




export const touch_start = (elem) => {
    return (e) => {
        e.preventDefault()
        pos_touch_start = get_pos(e)
        set_transform(elem)
    }
}

export const touch_end = (elem, callback) => {
    return (e) => {
        e.preventDefault()

        if (offset.length > 38) {
            const quarter = Math.PI / 4
            const angle = offset.angle()

            if (quarter <= angle && angle < 3 * quarter) {
                callback( 'swipe_top')
            } else if (3 * quarter <= angle && angle < 5 * quarter) {
                callback('swipe_right')
            } else if (5 * quarter <= angle && angle < 7 * quarter) {
                callback('swipe_bottom')
            } else {
                callback('swipe_left')
            }
        } else if (offset.length <= 0) {
            callback('click')
        }
        pos_touch_start = null
        offset = Vector.ZERO
        set_transform(elem)
    }
}

export const touch_move = (elem) => {
    return (e) => {
        e.preventDefault()
        if (pos_touch_start) {
            const pos = get_pos(e)
            offset = pos.copy().sub(pos_touch_start)
            const length = Math.min(offset.length, offset_max)
            offset = offset.normalize().mulScalar(length)
            set_transform(elem)
        }
    }
}

const set_transform = (elem) => {
    const transform = `transform: translate3d(${offset.x}px, ${offset.y}px, 0)`
    const z_index = offset.x + offset.y !== 0 ? '99' : '3'
    anime.set(elem, {
        translateX: offset.x,
        translateY: offset.y,
    })

    anime.set(elem.parentNode, {
        'z-index': z_index
    })
}