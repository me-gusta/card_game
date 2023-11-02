import {getRandomInt, in_array, range, shuffleArray} from "../game/helpers";
import {flip_card, update_card} from "../animations/flip";
import actions from "../game/actions";
import {extract_digits, img_url, new_element, q, sleep} from "../animations/helpers";
import {
    CardType,
    CardVariant,
    E_CardType,
    GodLike,
    InHand,
    InLootPile,
    IsChosen,
    IsFaded,
    LevelData,
    LevelResults,
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
import {remove_active_elem, touch_end, touch_move, touch_start} from "../animations/card_movement";
import {from_v, to_v, v} from "../game/local_math";
import {weapons_map} from "../game/behaviours/weapons";
import {anim_use_card} from "../animations/interactions";
import {extract, world_global} from "../global/create_world";
import {init_route} from "../routing";
import routes from "../routes";
import {Draggable} from '@shopify/draggable';
import {Vector} from "../esc/vector";

const cards_amount = 12 - 3
const max_card_y = cards_amount / 3 - 1

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
        return false

    if (cardA.has(OnSwapDisabled))
        return false

    if (cardA.get(Value) === 0)
        return false

    if (cardA.get(OnSwap)) {
        const {on_swap} = mobs_map.get(cardA.get(CardVariant))
        on_swap(cardA, cardB)
        return true
    }
}

const make_on_swap = (cardA, cardB) => {
    const a = init_on_swap(cardA, cardB)
    const b = init_on_swap(cardB, cardA)
    return a || b
}

const anim_swipe = (keyA, keyB) => {
    const elemA = document.querySelector(`#card-${keyA}`)
    const elemB = document.querySelector(`#card-${keyB}`)

    const v_a = to_v(keyA)
    const v_b = to_v(keyB)
    const diff = v_a.copy().sub(v_b)

    let direction
    if (diff.x === -1) {
        direction = 'left'
    } else if (diff.x === 1) {
        direction = 'right'
    } else if (diff.y === -1) {
        direction = 'up'
    } else if (diff.y === 1) {
        direction = 'down'
    }

    flip_card(elemA, {
        direction
    })
    flip_card(elemB, {
        direction
    })
}

const check_dead = () => {
    let is_someone_dead = false
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
        is_someone_dead = true


        const card = document.querySelector('#card-' + key)
        flip_card(card)
    }

    for (let ent of world.q(Value, InHand)) {
        if (ent.get(Value) > 0) continue

        const key = ent.get(InHand)
        world.killEntity(ent)

        const card = document.querySelector('#card-hand' + key)
        is_someone_dead = true
        // flip_card(card, true)
    }
    return is_someone_dead
}

const anim_swipe_points = () => {
    const pd = get_godlike.player_data()
    q('.power').textContent = pd.swipe_points
}

const set_hand_card_value = (ent) => {
    const card = document.querySelector('#card-hand' + ent.get(InHand)).querySelector('.card-value')
    card.textContent = ent.get(Value)
}

let can_process = true
const process_event = async (data) => {

    if (!can_process) return;

    const action = data.action
    const key = Number(data.key)
    const location = data.location

    console.log(action, location, key)


    if (action.startsWith('swipe') && location === 'board') {

        const player = get_godlike.player_data()
        if (player.swipe_points === 0)
            return

        const pos_this = to_v(key)
        const dir = get_swipe_direction(action.slice(6))
        const key_other = from_v(pos_this.add(dir))

        let neighbour = world.qo(new OnBoard(key_other))

        if (neighbour === undefined) return

        can_process = false

        let card = world.qo(new OnBoard(key))
        const is_on_swap = make_on_swap(card, neighbour)

        console.log(is_on_swap)

        const delay = is_on_swap ? 300 : 0

        setTimeout(async () => {
            const is_dead = check_dead()
            console.log('is_dead', is_dead)
            if (is_dead)
                await sleep(500)

            // query one more time because of possible exception if cards are dead
            card = world.qo(new OnBoard(key))
            neighbour = world.qo(new OnBoard(key_other))


            card.remove(OnBoard)
            neighbour.remove(OnBoard)

            card.add(new OnBoard(key_other))
            neighbour.add(new OnBoard(key))

            player.swipe_points -= 1
            anim_swipe_points()
            anim_swipe(key, key_other)

            actions.ensure_faded()
            await sleep(250)

            anim_faded()

            can_process = true
        }, delay)
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
            console.log('sadad')
        })

        setTimeout(() => {
            check_dead()
            actions.ensure_active_item()
            actions.ensure_faded()
            anim_faded()
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
        actions.ensure_faded()
        anim_faded()
        // parse_all()
    }
}

const card_event = (elem) => {
    return async (action) => {
        return await process_event({
            key: extract_digits(elem.id),
            location: elem.id.includes('hand') ? 'hand' : 'board',
            action
        })
    }
}

export const find_image = (ent, for_css = false) => {
    const folders = new Map([
        [E_CardType.food, 'food'],
        [E_CardType.weapon, 'weapons'],
        [E_CardType.crate, 'misc'],
        [E_CardType.coin, 'misc'],
        [E_CardType.mob, 'mobs']
    ])
    const type = ent.get(CardType)
    const variant = ent.get(CardVariant)

    const folder = folders.get(type)
    const file_name = variant || type
    const ext = type === E_CardType.mob ? 'gif' : 'png'

    if (type === E_CardType.mob) {
        const ld = extract(LevelData)
        return img_url(
            `${folder}/${ld.theme}/${file_name}.${ext}`,
            for_css
        )
    }


    return img_url(
        `${folder}/${file_name}.${ext}`,
        for_css
    )
}
export const create_card = (cfg: { i, ent?, no_events?, transparent? }) => {
    const {i, ent, no_events, transparent} = cfg

    const location = (i).toString().includes('hand') ? 'card-hand' : 'card-board'

    let value = ''
    let img = ''

    if (ent !== undefined) {
        value = ent.get(Value)
        img = find_image(ent, true)
    }

    const card = new_element(`<div class="card ${location}" id="card-${i}"></div>`, {
        opacity: transparent ? 0 : 1
    })

    if (!no_events) {
        // card.ontouchend = touch_end(card, card_event(card))
        // card.ontouchstart = touch_start(card)
        // card.ontouchmove = touch_move(card)
    }

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

    for (let i = cards_amount - 1; i >= 0; i--) {
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
            ent: ent,
            transparent: ent === undefined
        })

        hand.appendChild(card)
    }
}

const check_if_finished = async () => {
    if (world.q(OnBoard).length > 0) return

    const player_data = get_godlike.player_data()

    world_global.qo(GodLike).add(
        new LevelResults({
            hp: player_data.hp,
            coins: player_data.coins
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


export const anim_faded = () => {
    const faded = world.q(IsFaded).map(ent => ent.get(OnBoard))
    for (let i = 0; i < cards_amount; i ++) {
        const targets = q('#card-'+ i)
        const opacity = in_array(faded, i) ? 0.6 : 1
        anime({
            targets,
            duration: 50,
            easing: 'easeOutQuint',
            opacity
        })
    }
}

const start_turn = async () => {
    actions.start_turn()

    actions.ensure_active_item()
    actions.ensure_faded()
    anim_faded()

    await sleep(200)
    // await check_dead()
    anim_swipe_points()
    anim_hand_selection()


}
const flip_all = async () => {
    const numbers = shuffleArray([...range(0, cards_amount)])
    for (let i of numbers) {
        const card = document.querySelector('#card-' + i)
        flip_card(card)
        await sleep(15)
    }
}

const move_deck2 = async () => {

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
        // easing: 'linear',
        translateY: '109.01%',
        duration: 500,
        complete: async () => {
            for (let y = 0; y < (cards_amount / 3); y++) {
                for (let x = 0; x < 3; x++) {
                    const elem = document.querySelector('#card-' + from_v([x, y]))
                    if (y === max_card_y) {
                        anime.set(elem, {
                            translateY: '-130%',
                            translateX: '0%',
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
                        translateX: '0%',
                        opacity: 1,
                        scale: 1,
                        scaleX: 1,
                        scaleY: 1,
                    })
                }
            }

            for (let x = 0; x < 3; x++) {
                actions.add_new_on_board(v(x, max_card_y))
                const elem = document.querySelector('#card-' + from_v([x, max_card_y]))
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
}


const move_deck = async () => {

    for (let x = 2; x >= 0; x--) {
        actions.consume_card(x)
        await sleep(255)

    }

    for (let y = 1; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            actions.move_down_on_board(v(x, y))
        }
    }
    await sleep(200)

    const margin = q('#card-0').getBoundingClientRect().height
    console.log(margin)

    for (let y = 0; y < (cards_amount / 3); y++) {
        for (let x = 0; x < 3; x++) {
            const elem = document.querySelector('#card-' + from_v([x, y]))
            const opacity = y === max_card_y ? 0 : 1
            anime.set(elem, {
                translateX: '0%',
                opacity: opacity,
                scaleX: 1,
                scaleY: 1,
                scale: 1,
            })
            continue
            if (y === 0) {
                anime.set(elem, {
                    translateY: '-330%',
                    translateX: '0%',
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    scale: 1,
                })

                anime.set(elem.parentElement, {
                    'z-index': 210
                })
                continue
            }
        }
    }

    anime.set('.board', {
        translateY: -margin - 10
    })

    // for (let x = 0; x < 3; x++) {
    //     actions.add_new_on_board(v(x, max_card_y))
    //     const elem = document.querySelector('#card-' + from_v([x, max_card_y]))
    //     update_card(elem)
    // }

    for (let y = 0; y < (cards_amount / 3); y++) {
        for (let x = 0; x < 3; x++) {
            if (y === max_card_y)
                actions.add_new_on_board(v(x, max_card_y))
            const elem = document.querySelector('#card-' + from_v([x, y]))
            update_card(elem)
            anime.set(elem, {
                translateY: '0%',
                translateX: '0%',
                scale: 1,
                scaleX: 1,
                scaleY: 1,
            })
            // anime.set('.board', {
            //     translateY: '0%',
            // })
        }
    }
    // return

    const after = async () => {
        for (let y = 0; y < (cards_amount / 3); y++) {
            for (let x = 0; x < 3; x++) {
                const elem = document.querySelector('#card-' + from_v([x, y]))
                update_card(elem)
                anime.set(elem, {
                    translateY: '0%',
                    translateX: '0%',
                    opacity: 1,
                    scale: 1,
                    scaleX: 1,
                    scaleY: 1,
                })
                anime.set('.board', {
                    translateY: '0%',
                })
            }
        }
        return




    }

    anime({
        targets: '.card-board',
        easing: 'easeOutSine',
        // translateY: '30%',
        opacity: 1,
        duration: 100,
        // complete: after
    })

    anime({
        targets: '.board',
        easing: 'easeOutBack',
        translateY: 0,
        duration: 300,
        // complete: after
    })
}


const end_turn = async () => {
    console.log('end turn')
    actions.end_turn()

    actions.remove_faded()
    anim_faded()
    await sleep(50)

    if (actions.trigger_on_end_turn()) {
        if (check_dead())
            await sleep(350 + 400)
        else
            await sleep(350)
        console.log('epyy')
    }

    const pd = get_godlike.player_data()
    pd.swipe_points = pd.swipe_points_max

    await move_deck()

    await sleep(1000)

    // for (let i = 0; i < cards_amount; i++) {
    //     anime.set('#card-' + i, {
    //         transformX: 0
    //     })
    // }

    if (!await check_if_finished())
        await start_turn()
}

export const run_level = async () => {
    document.querySelector('.next-turn').addEventListener('click', end_turn)

    setup()


    create_board()
    create_hand()

    const draggable = new Draggable(document.querySelector('.level'), {
        draggable: '.card',
    })
    draggable.removePlugin(Draggable.Plugins.Mirror)
    console.log(draggable)
    draggable.on('drag:start', (e: any) => {
        const data = e.data.sensorEvent.data
        const elem = data.originalSource
        const pos = Vector.new(data.clientX, data.clientY)
        touch_start(elem)(pos)
    })
    draggable.on('drag:move', (e: any) => {
        const find_card = (element) => {
            if (element == null)
                return undefined
            let i = 4
            while (i > 0) {
                if (element.classList.contains('card'))
                    return element
                element = element.parentElement
                if (element == null)
                    return undefined
            }
            return undefined
        }
        const data = e.data.sensorEvent.data
        const elem = find_card(data.target)
        if (elem === undefined) {
            remove_active_elem()
            return
        }
        const pos = Vector.new(data.clientX, data.clientY)
        touch_move(elem)(pos)
    })
    draggable.on('drag:stop', (e: any) => {
        const elem = e.data.originalSource
        touch_end(elem, card_event(elem))()
    })

    await flip_all()
    await start_turn()
    // setTimeout(flip_all, 100)
    // setTimeout(start_turn, 1400)

}