import anime from 'animejs/lib/anime.es.js';
import {flip_card} from "./animations/flip";
import {extract_digits, find_image, img_css, new_element, sleep} from "./animations/helpers";
import {getRandomInt, in_array, range, round, shuffleArray} from "./game/helpers";
import {anim_use_card, anim_bounce_card, anim_collect_card} from "./animations/interactions";
import {recreate_world, world} from "./game/create_world";
import create from "./game/create";
import {one_v2} from "./game/rng";
import actions from "./game/actions";
import {
    CardVariant,
    InHand, InLootPile,
    IsChosen,
    IsFaded, LootId,
    OnBoard,
    OnCardAttacked,
    OnSwap,
    OnSwapDisabled,
    Value
} from "./game/components";
import {touch_end, touch_move, touch_start} from "./animations/card_movement";
import {from_v, to_v} from "./game/local_math";
import get_godlike from "./game/get_godlike";
import {weapons_map} from "./game/behaviours/weapons";
import {mobs_map} from "./game/behaviours/mobs";

const app = document.querySelector('#app')

const board = document.querySelector('.board')

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

    console.log(is_active, ent.get(IsChosen))

    if (is_active && ent.get(IsChosen)) return

    if (is_active) {
        class_list.remove('active')
        anime({
            targets: card,
            duration: 100,
            easing: 'easeOutQuad',
            opacity: 0,
            scale: 0.6
        })
    } else {
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



const card_click = (card: HTMLElement) => {
    const in_hand = card.id.includes('hand')
    console.log('click card', in_hand)
    // bounce_card(card)
    // choose_card(card)
    // if (in_hand)
    //     choose_card(card)
    // else
    //     collect_card(card)
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

        console.log(key)

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



const process_event = (data) => {

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

        const card = world.qo(new OnBoard(key))
        card.remove(OnBoard)
        neighbour.remove(OnBoard)

        card.add(new OnBoard(key_other))
        neighbour.add(new OnBoard(key))

        console.log('aa')

        anim_swipe(key, key_other)

        init_on_swap(card, neighbour)
        init_on_swap(neighbour, card)

        player.swipe_points -= 1
        // await check_dead()
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

    let value = ''
    let img = ''

    if (ent !== undefined) {
        value = ent.get(Value)
        img = find_image(ent, true)
    }

    const card = new_element(`<div class="card" id="card-${i}"></div>`)

    card.ontouchend = touch_end(card, card_event(card))
    card.ontouchstart = touch_start(card)
    card.ontouchmove= touch_move(card)

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

    for (let i = 0; i < 3; i ++) {
        const ent = world.qo(new InHand(i))

        const card = create_card({
            i: 'hand' + i,
            ent: ent
        })
        hand.appendChild(card)
    }
}

const show_debug_data = (...data) => {
    let text = ''
    for (let d of data) {
        text += JSON.stringify(d) + '\n'
    }
    document.querySelector('.debug-text').textContent = text.slice(0, text.length - 1)
}


//////////////////////////////////////////////////////////

const test_gen_one = () => {
    const mul_by_variant = {
        'mace': 4,
        'whip': 3,
        'sword': 1
    }

    const amounts = [
        ['mob', 47],
        ['food', 13],
        ['weapon', 15]
    ]

    const sum = {
        mob: 0,
        food: 0,
        weapon: 0
    }

    const cards = []
    for (let [type, amount] of amounts) {
        for (let i = 0; i < amount; i++) {
            const gen = one_v2(type)
            const mul = mul_by_variant[gen.variant] || 1
            sum[gen.type] += gen.value * mul
            cards.push(gen)
        }
    }

    const good = sum.food + sum.weapon
    const bad = sum.mob
    const total = good + bad
    const bad_percent = round(bad / total, 2)
    const good_percent = round(good / total)
    show_debug_data(sum, {bad_percent, good_percent})
    return {cards, percent: {bad_percent, good_percent}}
}

const test_gen = (target = 0.48) => {
    if (target >= 0.49)
        throw Error('Target value is unplayable')
    const gap = 0.01

    let bad_percent = 999
    let data
    while (bad_percent > target + gap || bad_percent < target - gap) {
        data = test_gen_one()
        bad_percent = data.percent.bad_percent
    }
    return data
}

//////////////////////////////////////////////////////////

const run_data = {
    player: {
        hp_max: 20,
        hp: 20,
        coins: 0
    },
    multiplier: 1,
    level_probabilities: new Map([
        ['mob', [
            [80, 'spider'],
            [20, 'rat'],
        ]],
        ['food', [
            [80, 'apple'],
            [20, 'omlet'],
        ]],
        ['weapon', [
            [55, 'sword'],
            [25, 'whip'],
            [20, 'mace'],
        ]]
    ])
}

const setup = () => {
    recreate_world()
    create.godlike(run_data)


    create.upcoming(
        test_gen()
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
    // const hand = document.querySelector('.hand')

    // world.q(InHand).forEach(ent => {
    //     const elem = hand.querySelector('#card-hand' + ent.get(InHand))
    //     console.log(elem)
    //     choose_card(elem)
    // })
}

const flip_all = async () => {
    const numbers = shuffleArray([...range(0, 12)])
    for (let i of numbers) {
        const card = document.querySelector('#card-' + i)
        flip_card(card)
        // await sleep(50)
    }
}

const end_turn = () => {
    console.log('end turn')
}

const main = async () => {
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

main().then()