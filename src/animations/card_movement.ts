import {Vector} from "../ecw/vector";
import anime from "animejs/lib/anime.es";
import {world} from "../game/create_world";
import {InHand, IsChosen} from "../game/components";

let pos_touch_start = null

const offset_max = 50
let offset = Vector.ZERO

let time = null

let active_elem

const set_active_elem = (x) => {
    active_elem = x
}

export const remove_active_elem = () => {
    if (active_elem !== undefined)
        set_transform(document.querySelector('#' + active_elem), Vector.ZERO)

    active_elem = undefined
    time = null
}

export const touch_start = (elem) => {
    return (pos) => {
        pos_touch_start = pos
        console.log('POS:', pos_touch_start)
        console.log(elem.id)
        set_active_elem(elem.id)
        set_transform(elem, offset)
        time = Date.now()
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
        } else {
            const time_delta = Date.now() - time
            console.log(time_delta)
            if (time_delta >= 500) {
                await callback('long_press')
            } else if (offset.length <= 0) {
                await callback('click')
            }
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
const anim_toggle_card = (i) => {
    const ent = world.qo(new InHand(i))
    const card = document.querySelector('#card-hand' + i +':not(.draggable--over)')
    const class_list = card.parentElement.classList

    const is_active = class_list.contains('active')

    if (ent === undefined) {
        class_list.remove('active')
        anime({
            targets: card,
            duration: 100,
            easing: 'easeOutQuad',
            opacity: 0,
            scale: 0.6
        })
        return
    }

    if (is_active && ent.get(IsChosen)) return

    if (is_active && !ent.get(IsChosen)) {
        class_list.remove('active')
        anime.set(card,{
            scale: 1
        })
    } else if (ent.get(IsChosen)) {
        anim_choose_card(card)
    }
}
export const anim_hand_selection = () => {
    for (let i = 0; i < 3; i++) {
        anim_toggle_card(i)
    }
}
const anim_choose_card = (card) => {
    card.parentNode.classList.add('active')
    anime({
        targets: card,
        duration: 100,
        easing: 'easeOutQuad',
        keyframes: [
            {scale: 1},
            {scale: 0.7},
            {scale: 0.8},
            {scale: 0.9},
        ],
    })
}