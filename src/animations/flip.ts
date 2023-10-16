import anime from "animejs/lib/anime.es";
import {extract_digits, find_image, img_css, img_url} from "./helpers";
import {world} from "../game/create_world";
import {InHand, OnBoard, Value} from "../game/components";

const duration = 200 //* 20
const ease1 = 'easeOutQuad'

const shape_equal = 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)'
const shape_left = 'polygon(0% 82.5%, 0% 17.5%, 100% 0%, 100% 100%)'
const shape_right = 'polygon(0% 100%, 0% 0%, 100% 17.5%, 100% 82.5%)'

const shape_up = 'polygon(0% 100%, 17.5% 0% , 82.5% 0%, 100% 100%)'
const shape_bottom = 'polygon(17.5% 100%, 0% 0%, 100% 0%, 82.5% 100%)'


const down_show_edge = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(card, {
        'flex-direction': 'column'
    })

    anime.set(side, {
        'clip-path': shape_up,
        width: '100%',
        height: '0'
    })
    anime.set(body, {
        width: '100%',
    })

    const timeline = anime.timeline({
        easing: ease1,
        duration: duration,
    })

    timeline.add({
        targets: icon,
        translateY: '20%',
        rotateX: 90,
    }).add({
        targets: img,
        rotateX: -40,
    }, 0).add({
        targets: body,
        'clip-path': shape_bottom,
        height: '0%',
    }, 0).add({
        targets: side,
        'clip-path': shape_equal,
        keyframes: [
            {height: '2%'},
            {height: '5%'},
            {height: '10%'},
        ],
    }, 0).add({
        targets: card,
        translateY: '50%',
        easing: 'linear',
    }, 0)
    return timeline
}


const down_rotate_edge = (card) => {
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
            anime.set(side, {
                'width': '0%'
            })
        }
    })
    timeline.add({
        targets: img,
        rotateX: 0,
        scaleY: 1,
    }, 0).add({
        targets: icon,
        translateY: '0%',
        rotateX: 0,
    }, 0).add({
        targets: body,
        height: '100%',
        'clip-path': shape_equal,
    }, 0).add({
        targets: side,
        keyframes: [
            {height: '10%'},
            {height: '5%'},
            {height: '2%'},
            {height: '2%'},
            {height: '1%'},
            {height: '1%'},
            {height: '0%'},
        ],
        'clip-path': shape_bottom,
    }, 0).add({
        targets: card,
        translateY: '0%',
    }, 0)

    return timeline
}


const down_prepare_for_rotate = (card) => {
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(icon, {
        translateY: '-30%',
        rotateX: -90,
    })

    anime.set(img, {
        rotateX: 45,
    })

    anime.set(body, {
        'clip-path': shape_up,
    })
    anime.set(card, {
        'flex-direction': 'column-reverse'
    })
}


const up_show_edge = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(card, {
        'flex-direction': 'column-reverse'
    })

    anime.set(side, {
        'clip-path': shape_bottom,
        width: '100%',
        height: '0'
    })
    anime.set(body, {
        // 'clip-path': shape_up,
        width: '100%',
    })
    // return

    const timeline = anime.timeline({
        easing: ease1,
        duration: duration,
    })

    timeline.add({
        targets: icon,
        translateY: '-20%',
        rotateX: -90,
    }).add({
        targets: img,
        rotateX: 40,
    }, 0).add({
        targets: body,
        'clip-path': shape_up,
        height: '0%',
    }, 0).add({
        targets: side,
        'clip-path': shape_equal,
        keyframes: [
            {height: '2%'},
            {height: '5%'},
            {height: '10%'},
        ],
    }, 0).add({
        targets: card,
        translateY: '50%',
        easing: 'linear',
    }, 0)
    return timeline
}


const up_rotate_edge = (card) => {
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
            anime.set(side, {
                'width': '0%'
            })
        }
    })
    timeline.add({
        targets: img,
        rotateX: 0,
        scaleY: 1,
    }, 0).add({
        targets: icon,
        translateY: '0%',
        rotateX: 0,
    }, 0).add({
        targets: body,
        height: '100%',
        'clip-path': shape_equal,
    }, 0).add({
        targets: side,
        keyframes: [
            {height: '10%'},
            {height: '5%'},
            {height: '2%'},
            {height: '2%'},
            {height: '1%'},
            {height: '1%'},
            {height: '0%'},
        ],
        'clip-path': shape_up,
    }, 0).add({
        targets: card,
        translateY: '0%',
    }, 0)

    return timeline
}


const up_prepare_for_rotate = (card) => {
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(icon, {
        translateY: '30%',
        rotateX: 90,
    })

    anime.set(img, {
        rotateX: -45,
    })

    anime.set(body, {
        'clip-path': shape_bottom,
    })
    anime.set(card, {
        'flex-direction': 'column'
    })
}

const left_show_edge = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(card, {
        'flex-direction': 'row-reverse'
    })

    anime.set(side, {
        'clip-path': shape_right,
    })

    const timeline = anime.timeline({
        easing: ease1,
        duration: duration,
    })

    timeline.add({
        targets: icon,
        translateX: '-50%',
        rotateY: -90,
    }).add({
        targets: img,
        rotateY: -40,
    }, 0).add({
        targets: body,
        'clip-path': shape_left,
        width: '0%',
    }, 0).add({
        targets: side,
        'clip-path': shape_equal,
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


const left_rotate_edge = (card) => {
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
        'clip-path': shape_equal,
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
        'clip-path': shape_left,
    }, 0).add({
        targets: card,
        translateX: '0%',
    }, 0)

    return timeline
}


const left_prepare_for_rotate = (card) => {

    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(icon, {
        translateX: '50%',
        rotateY: 90,
    })

    anime.set(img, {
        rotateY: 45,
    })

    anime.set(body, {
        'clip-path': shape_right,
    })
    anime.set(card, {
        'flex-direction': 'row'
    })
}

const right_show_edge = (card) => {
    const side = card.parentNode.querySelector('.card-side')
    const body = card.parentNode.querySelector('.card-body')

    const img = card.parentNode.querySelector('.card-img')
    const icon = card.parentNode.querySelectorAll('.card-content')

    anime.set(side, {
        'clip-path': shape_left,
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
        'clip-path': shape_right,
        width: '0%',
    }, 0).add({
        targets: side,
        'clip-path': shape_equal,
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

const right_rotate_edge = (card) => {
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
        'clip-path': shape_equal,
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
        'clip-path': shape_right,
    }, 0).add({
        targets: card,
        translateX: '0%',
    }, 0)

    return timeline
}

const right_prepare_for_rotate = (card) => {

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
        'clip-path': shape_left,
    })
    anime.set(card, {
        'flex-direction': 'row-reverse'
    })
}

export const update_card = (card, in_hand = false) => {
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
    const brick = img_css('textures/brick')
    const url = (bg_img as string).includes('brick') ? img_css('textures/gold') : brick
    // anime.set(img, {
    // 'background-image': url,
    // })
    const value = card.parentNode.querySelector('.card-value')
    value.textContent = ent ? ent.get(Value) : ''
}

export const flip_card = (card, cfg: {
    in_hand?,
    custom_update?,
    direction?
} = {direction: 'right'}) => {

    anime.set(card, {
        translateX: 0,
        translateY: 0,
        'box-shadow': '0px 0px 0px -2px rgba(0, 0, 0, 0.2)'
    })


    const side = card.parentNode.querySelector('.card-side')
    anime.set(side, {
        height: '100%',
        width: 0,
    })

    let {in_hand, custom_update, direction} = cfg

    if (!direction)
        direction = 'right'

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

    if (direction === 'right') {
        right_show_edge(card).finished.then(() => {
            if (custom_update)
                custom_update()
            else
                update_card(card, in_hand)

            right_prepare_for_rotate(card)
            setTimeout(
                () => right_rotate_edge(card),
                30
            )
        })
    } else if (direction === 'left') {
        left_show_edge(card).finished.then(() => {
            if (custom_update)
                custom_update()
            else
                update_card(card, in_hand)

            left_prepare_for_rotate(card)
            setTimeout(
                () => left_rotate_edge(card),
                30
            )
        })
    } else if (direction === 'up') {
        up_show_edge(card).finished.then(() => {
            if (custom_update)
                custom_update()
            else
                update_card(card, in_hand)

            up_prepare_for_rotate(card)
            setTimeout(
                () => up_rotate_edge(card),
                30
            )
        })
    } else if (direction === 'down') {
        down_show_edge(card).finished.then(() => {
            if (custom_update)
                custom_update()
            else
                update_card(card, in_hand)

            down_prepare_for_rotate(card)
            setTimeout(
                () => down_rotate_edge(card),
                30
            )
        })
    }
}