import anime from "animejs/lib/anime.es";
import {extract_digits, find_image, img_css, img_url} from "./helpers";
import {world} from "../game/create_world";
import {InHand, OnBoard, Value} from "../game/components";

const duration = 200
const ease1 = 'easeOutQuad'

const show_right_edge = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(side, {
        'clip-path': 'polygon(0% 82.5%, 0% 17.5%, 100% 0%, 100% 100%)',
    })

    const timeline = anime.timeline({
        easing: ease1,
        duration: duration,
    })

    timeline.add({
        targets: icon,
        translateX: '50%',
        rotateY: 90,
    }).add({
        targets: img,
        rotateY: 40,
    }, 0).add({
        targets: body,
        'clip-path': 'polygon(0% 100%, 0% 0%, 100% 17.5%, 100% 82.5%)',
        width: '0%',
    }, 0).add({
        targets: side,
        'clip-path': 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)',
        keyframes: [
            {width: '2%'},
            {width: '5%'},
            {width: '10%'},
        ],
    }, 0).add({
        targets: card,
        translateX: '50%',
        easing: 'linear',
    }, 0)
    return timeline
}

const rotate_edge_right = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')



    const timeline = anime.timeline({
        easing: ease1,
        duration: duration,
        complete: () => {
            anime.set(card, {
                'flex-direction': 'row'
            })
        }
    })
    timeline.add({
        targets: img,
        rotateY: 0,
        scaleX: 1,
    }, 0).add({
        targets: icon,
        translateX: '0%',
        rotateY: 0,
    }, 0).add({
        targets: body,
        width: '100%',
        'clip-path': 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)',
    }, 0).add({
        targets: side,
        keyframes: [
            {width: '10%'},
            {width: '5%'},
            {width: '2%'},
            {width: '2%'},
            {width: '1%'},
            {width: '1%'},
            {width: '0%'},
        ],
        'clip-path': 'polygon(0% 100%, 0% 0%, 100% 17.5%, 100% 82.5%)',
    }, 0).add({
        targets: card,
        translateX: '0%',
    }, 0)

    return timeline
}

const prepare_for_rotate = (card) => {

    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(icon, {
        translateX: '-50%',
        rotateY: -90,
    })

    anime.set(img, {
        rotateY: -45,
    })

    anime.set(body, {
        'clip-path': 'polygon(0% 82.5%, 0% 17.5%, 100% 0%, 100% 100%)',
    })
    anime.set(card, {
        'flex-direction': 'row-reverse'
    })
}

export const update_card = (card, in_hand=false) => {
    const id = extract_digits(card.id)

    const ent = in_hand ? world.qo(new InHand(id)) : world.qo(new OnBoard(id))

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelector('.card-icon')

    const bg_icon = anime.get(icon, 'background-image')
    const url_icon = ent ? find_image(ent, true) : ''

    anime.set(icon, {
        'background-image': `${url_icon}`,
    })


    const bg_img = anime.get(img, 'background-image')
    const brick =  img_css('textures/brick')
    const url = (bg_img as string).includes('brick') ? img_css('textures/gold') : brick
    // anime.set(img, {
        // 'background-image': url,
    // })
    const value = card.parentNode.querySelector('.card-value')
    value.textContent = ent ? ent.get(Value) : ''
}

export const flip_card = (card, in_hand=false) => {

    anime.set(card, {
        translateX: 0,
        translateY: 0,
    })

    anime({
        targets: card.parentNode,
        keyframes: [
            {scale: 1},
            {scale: 0.8},
            {scale: 0.8},
            {scale: 0.8},
            {scale: 0.9},
            {scale: 1.2},
            {scale: 1},
        ],
        easing: ease1,
        duration: duration + 50
    })

    show_right_edge(card).finished.then(() => {
        update_card(card, in_hand)
        prepare_for_rotate(card)
        setTimeout(
            () => rotate_edge_right(card),
            30
        )
    })
}