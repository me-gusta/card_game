import {getRandomInt, range, round, shuffleArray} from "../game/helpers";
import {flip_card, update_card} from "../animations/flip";
import actions from "../game/actions";
import {extract_digits, find_image, new_element, sleep} from "../animations/helpers";
import {
    CardVariant, GodLike,
    InHand,
    InLootPile,
    IsChosen,
    IsFaded,
    LootId,
    OnBoard,
    OnCardAttacked,
    OnSwap,
    OnSwapDisabled,
    Value
} from "../game/components";
import {recreate_world, world} from "../game/create_world";
import create from "../game/create";
import anime from "animejs/lib/anime.es";
import {mobs_map} from "../game/behaviours/mobs";
import get_godlike from "../game/get_godlike";
import {touch_end, touch_move, touch_start} from "../animations/card_movement";
import {one_v2} from "../game/rng";
import {from_v, to_v, v} from "../game/local_math";
import {weapons_map} from "../game/behaviours/weapons";
import {anim_use_card} from "../animations/interactions";
import {extract, world_global} from "../global/create_world";
import {LevelData, LevelResults} from "../global/components";
import {init_route} from "../routing";
import routes from "../routes";

const anim_toggle_card = (i) => {
    const ent = world.qo(new InHand(i))
    const card = document.querySelector('#card-hand' + i)
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
        // anime({
        //     targets: card,
        //     duration: 100,
        //     easing: 'easeOutQuad',
        //     opacity: 0,
        //     scale: 0.6
        // })
    } else if (ent.get(IsChosen)) {
        choose_card(card)
    }
}
const anim_hand_selection = () => {
    for (let i = 0; i < 3; i++) {
        anim_toggle_card(i)
    }
}
const choose_card = (card) => {
    card.parentNode.classList.add('active')
    anime({
        targets: card,
        duration: 100,
        keyframes: [
            {scale: 1},
            {scale: 0.7},
            {scale: 0.8},
            {scale: 0.9},
        ],
        easing: 'easeOutQuad',
    })

}
const get_swipe_direction = (dir_string) => {
    switch (dir_string) {
        case 'top':
            return [0, 1]
        case 'bottom':
            return [0, -1]
        case 'left':
            return [1, 0]
        case 'right':
            return [-1, 0]
    }
}
const init_on_swap = (cardA, cardB) => {
    if (cardA === undefined || cardB === undefined)
        return

    if (cardA.has(OnSwapDisabled))
        return

    if (cardA.get(Value) === 0)
        return

    if (cardA.get(OnSwap)) {
        const {on_swap} = mobs_map.get(cardA.get(CardVariant))
        on_swap(cardA, cardB)
    }
}
const anim_swipe = (keyA, keyB) => {
    const elemA = document.querySelector(`#card-${keyA}`)
    const elemB = document.querySelector(`#card-${keyB}`)

    flip_card(elemA)
    flip_card(elemB)
}
const check_dead = () => {
    for (let ent of world.q(Value, OnBoard)) {
        if (ent.get(Value) > 0) continue

        const key = ent.get(OnBoard)
        if (ent.has(LootId)) {
            const loot_card = world.qe(ent.get(LootId))
            loot_card.remove(InLootPile)
            loot_card.add(new OnBoard(key))
        } else {
            const coin = create.coin()
            coin.add(new OnBoard(key))
        }
        world.killEntity(ent)


        const card = document.querySelector('#card-' + key)
        flip_card(card)
    }

    for (let ent of world.q(Value, InHand)) {
        if (ent.get(Value) > 0) continue

        const key = ent.get(InHand)
        world.killEntity(ent)

        const card = document.querySelector('#card-hand' + key)
        // flip_card(card, true)
    }
}
const set_hand_card_value = (ent) => {
    const card = document.querySelector('#card-hand' + ent.get(InHand)).querySelector('.card-value')
    card.textContent = ent.get(Value)
}
let can_process = true
const process_event = (data) => {

    if (!can_process) return;

    const action = data.action
    const key = data.key
    const location = data.location

    console.log(action, location, key)


    if (action.startsWith('swipe') && location === 'board') {

        const player = get_godlike.player_data()
        if (player.swipe_points === 0)
            return

        const pos_this = to_v(key)
        const dir = get_swipe_direction(action.slice(6))
        const key_other = from_v(pos_this.add(dir))

        const neighbour = world.qo(new OnBoard(key_other))

        if (neighbour === undefined) return

        can_process = false

        const card = world.qo(new OnBoard(key))
        card.remove(OnBoard)
        neighbour.remove(OnBoard)

        card.add(new OnBoard(key_other))
        neighbour.add(new OnBoard(key))

        anim_swipe(key, key_other)

        init_on_swap(card, neighbour)
        init_on_swap(neighbour, card)

        player.swipe_points -= 1
        // await check_dead()

        setTimeout(() => {
            can_process = true
        }, 250)
        return
    }


    if (location === 'board') {
        const target = world.qo(new OnBoard(key))
        const active_item = world.qo(InHand, IsChosen, CardVariant)

        if (target.has(IsFaded)) return

        if (active_item === undefined) return
        const {on_choice} = weapons_map.get(active_item.get(CardVariant))
        console.log('activate card')
        on_choice(active_item, target)

        anim_use_card(active_item)
        set_hand_card_value(active_item)
        // parse_all()

        world.q(OnCardAttacked, OnBoard).forEach(ent => {
            const {on_card_attacked} = mobs_map.get(ent.get(CardVariant))
            on_card_attacked(ent, target, active_item)
        })

        setTimeout(() => {
            check_dead()
            actions.ensure_active_item()
            setTimeout(anim_hand_selection, 100)
        }, 250)
        // parse_all()
        // await check_dead()
        // parse_all()

        // parse_all()


    } else {
        actions.deselect()
        actions.select_item_from_hand(key)
        anim_hand_selection()
        // parse_all()
    }

}
const card_event = (elem) => {
    return (action) => {
        return process_event({
            key: extract_digits(elem.id),
            location: elem.id.includes('hand') ? 'hand' : 'board',
            action
        })
    }
}
const create_card = (cfg: { i, ent? }) => {
    const {i, ent} = cfg

    const location = (i).toString().includes('hand') ? 'card-hand' : 'card-board'

    let value = ''
    let img = ''

    if (ent !== undefined) {
        value = ent.get(Value)
        img = find_image(ent, true)
    }

    const card = new_element(`<div class="card ${location}" id="card-${i}"></div>`)

    card.ontouchend = touch_end(card, card_event(card))
    card.ontouchstart = touch_start(card)
    card.ontouchmove = touch_move(card)

    const side = new_element(`<div class="card-side"></div>`, {
        'clip-path': 'polygon(0% 82.5%, 0% 17.5%, 100% 0%, 100% 100%)',
        width: '0%'
    })


    const body = new_element(`<div class="card-body"></div>`, {
        'clip-path': 'polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%)'
    })


    card.appendChild(side)
    card.appendChild(body)


    const wrap = new_element(`<div class="card-wrap"></div>`)

    wrap.appendChild(card)


    const elem_img = new_element(`<div class="card-img"></div>`, {
        perspective: 80,
    })
    body.appendChild(elem_img)

    const icon = new_element(`<div class="card-content card-icon"></div>`, {
        perspective: 200,
        'background-image': img ? img : ''
    })

    elem_img.appendChild(icon)

    if (value === undefined) {
        value = ''
    }
    const elem_value = new_element(`<div class="card-content card-value">${value}</div>`, {
        perspective: 200,
    })
    elem_img.appendChild(elem_value)

    return wrap
}
const create_card_empty = (i) => {
    return new_element(`
    <div class="card-wrap empty">
        <div class="card empty" id="card-${i}"></div>
    </div>`)
}
const create_board = () => {

    const board = document.querySelector('.board')

    for (let i = 11; i >= 0; i--) {
        board.appendChild(
            create_card({
                i: i,
            })
        )
    }
}
const create_hand = () => {
    const hand = document.querySelector('.hand')

    for (let i = 0; i < 3; i++) {
        const ent = world.qo(new InHand(i))

        const card = create_card({
            i: 'hand' + i,
            ent: ent
        })
        hand.appendChild(card)
    }
}

const check_if_finished = async () => {
    // if (world.q(OnBoard).length > 0) return

    const player_data = get_godlike.player_data()

    world_global.qo(GodLike).add(
        new LevelResults({
            hp: player_data.hp,
            coins: player_data.coins + getRandomInt(57, 90)
        })
    )
    await init_route(routes.run_ender)

    return true
}

const setup = () => {
    recreate_world()

    const level_data = extract(LevelData)

    create.godlike(level_data)

    const pd = get_godlike.player_data()
    document.querySelector('.hp').textContent = pd.hp
    document.querySelector('.hp-max').textContent = pd.hp_max


    create.upcoming(
        level_data.cards
    )
    create.hand()
    // calc()
    console.log('setup')

    actions.init_board()
}
const start_turn = async () => {
    actions.start_turn()
    actions.ensure_active_item()
    await sleep(200)
    // await check_dead()

    anim_hand_selection()


}
const flip_all = async () => {
    const numbers = shuffleArray([...range(0, 12)])
    for (let i of numbers) {
        const card = document.querySelector('#card-' + i)
        flip_card(card)
        // await sleep(50)
    }
}
const move_deck = async () => {

    for (let x = 2; x >= 0; x--) {
        actions.consume_card(x)
        // board = parse_board()
        // board[x] = undefined

        // hand = parse_hand()
        await sleep(250)

    }

    for (let y = 1; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            actions.move_down_on_board(v(x, y))
        }
    }

    anime({
        targets: '.card-board',
        translateY: '112%',
        duration: 500,
        complete: () => {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 3; x++) {
                    const elem = document.querySelector('#card-' + from_v([x, y]))
                    if (y === 3) {
                        anime.set(elem, {
                            translateY: '-130%',
                            opacity: 1,
                            scaleX: 1,
                            scaleY: 1,
                            scale: 1,
                        })

                        anime.set(elem.parentElement, {
                            'z-index': 10
                        })
                        continue
                    }

                    update_card(elem)
                    anime.set(elem, {
                        translateY: '0%',
                        opacity: 1,
                        scale: 1,
                        scaleX: 1,
                        scaleY: 1,
                    })
                }
            }

            for (let x = 0; x < 3; x++) {
                actions.add_new_on_board(v(x, 3))
                const elem = document.querySelector('#card-' + from_v([x, 3]))
                update_card(elem)
                anime({
                    targets: elem,
                    translateY: '0%',
                    duration: 500,
                    opacity: 1,
                })
            }


        }
    })


    // return


}
const end_turn = async () => {
    console.log('end turn')
    actions.end_turn()

    check_dead()

    const pd = get_godlike.player_data()
    pd.swipe_points = 2

    await move_deck()
    actions.ensure_active_item()
    actions.ensure_faded()

    await sleep(500)

    if (!await check_if_finished())
        await start_turn()
}

export const run_level = async () => {
    document.querySelector('.play').addEventListener('click', flip_all)
    document.querySelector('.next-turn').addEventListener('click', end_turn)

    setup()


    create_board()
    create_hand()

    await flip_all()
    await start_turn()
    // setTimeout(flip_all, 100)
    // setTimeout(start_turn, 1400)

}