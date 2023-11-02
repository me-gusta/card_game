import {Vector} from "../ecw/vector";
import anime from "animejs/lib/anime.es.js";
import {extract_digits} from "./helpers";

let is_moving = false
let pos_touch_start = null

const offset_max = 50
let offset = Vector.ZERO

const get_pos = (e) => Vector.new(e.touches[0].pageX, e.touches[0].pageY)

let active_elem

const set_active_elem = (x) => {
    active_elem = x
}

export const remove_active_elem = () => {
    if (active_elem !== undefined)
        set_transform(document.querySelector('#' + active_elem), Vector.ZERO)

    active_elem = undefined
}

export const touch_start = (elem) => {
    return (pos) => {
        pos_touch_start = pos
        console.log('POS:', pos_touch_start)
        console.log(elem.id)
        set_active_elem(elem.id)
        set_transform(elem, offset)
    }
}

export const touch_end = (elem, callback) => {
    return async () => {

        if (offset.length > 38) {
            const quarter = Math.PI / 4
            const angle = offset.angle()

            if (quarter <= angle && angle < 3 * quarter) {
                await callback( 'swipe_top')
            } else if (3 * quarter <= angle && angle < 5 * quarter) {
                await callback('swipe_right')
            } else if (5 * quarter <= angle && angle < 7 * quarter) {
                await callback('swipe_bottom')
            } else {
                await callback('swipe_left')
            }
        } else if (offset.length <= 0) {
            await callback('click')
        }
        pos_touch_start = null
        offset = Vector.ZERO
        remove_active_elem()
        // set_transform(elem, offset)
    }
}

export const touch_move = (elem) => {
    return (pos) => {
        if (active_elem !== elem.id)
            return
        if (pos_touch_start) {
            offset = pos.copy().sub(pos_touch_start)
            const length = Math.min(offset.length, offset_max)
            offset = offset.normalize().mulScalar(length)
            set_transform(elem, offset)
        }
    }
}

const set_transform = (elem, offset) => {
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