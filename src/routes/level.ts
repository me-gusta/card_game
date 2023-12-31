import {in_array, range, shuffleArray} from "../game/helpers";
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
import {anim_hand_selection, remove_active_elem, touch_end, touch_move, touch_start} from "../animations/card_movement";
import {from_v, pattern_col, pattern_row, relative, to_v, v} from "../game/local_math";
import {weapons_map} from "../game/behaviours/weapons";
import {anim_deal_damage, anim_hero_take_damage, anim_poison, anim_use_card} from "../animations/interactions";
import {extract, world_global} from "../global/create_world";
import {init_route} from "../routing";
import routes from "../routes";
import {Draggable} from '@shopify/draggable';
import {Vector} from "../ecw/vector";
import {half_or_kill} from "../game/behaviours/util";
import {createLogger} from "vite";

const set_available = () => {
    const as = get_godlike.action_switch()
    as.available = true
}

const is_available = () => {
    return get_godlike.action_switch().available
}

const set_unavailable = () => {
    const as = get_godlike.action_switch()
    as.available = false
}

const cards_amount = 12 - 3
const max_card_y = cards_amount / 3 - 1

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


const process = async (data) => {

    const action = data.action
    const key = Number(data.key)
    const location = data.location

    console.log(action, location, key)

    if (action === 'long_press') {
        const card = world.qo(new OnBoard(key))
        const ld = extract(LevelData)
        const type = card.get(CardType)
        const variant = card.get(CardVariant)

        const folder = type === E_CardType.mob ? `${ld.theme}/avatar/` : ''
        let url = `url('/assets/images/${type}/${folder}${variant}.png')`
        let title = variant

        if (type === E_CardType.crate) {
            url = `url('/assets/images/misc/crate.png')`
            title = 'chest'
        } else if (type === E_CardType.coin) {
            url = `url('/assets/images/misc/coin.png')`
            title = 'coin'
        }

        anime.set('.help-image', {
            'background-image': url
        })
        q('.help-title').innerHTML = title

        anime.set('.help', {
            display: 'flex'
        })
        anime({
            targets: '.help',
            easing: 'easeOutSine',
            duration: 500,
            opacity: 1
        })
        return
    }


    if (action.startsWith('swipe') && location === 'board') {

        const player = get_godlike.player_data()
        if (player.swipe_points === 0)
            return

        const pos_this = to_v(key)
        const dir = get_swipe_direction(action.slice(6))
        const key_other = from_v(pos_this.add(dir))

        let neighbour = world.qo(new OnBoard(key_other))

        if (neighbour === undefined) return


        let card = world.qo(new OnBoard(key))
        const is_on_swap = make_on_swap(card, neighbour)

        let delay_sum = is_on_swap ? 300 : 0

        await sleep(delay_sum)

        const is_dead = check_dead()
        console.log('is_dead', is_dead)
        if (is_dead) {
            delay_sum += 500
            await sleep(500)
        }

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

        if (actions.ensure_faded()) {
            await sleep(250)
            delay_sum += 250
            anim_faded()
        }

        set_available()

        return delay_sum
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
            actions.ensure_faded()
            anim_faded()
            setTimeout(anim_hand_selection, 100)
        }, 250)
        return 350
    } else {
        actions.deselect()
        actions.select_item_from_hand(key)
        anim_hand_selection()
        actions.ensure_faded()
        anim_faded()
    }
}

const check_coins_row = async () => {
    let for_update = []
    const checks = [
        {
            positions: [[0, 0], [1, 0], [2, 0]],
            pattern: pattern_col
        },
        {
            positions: [[0, 0], [0, 1], [0, 2]],
            pattern: pattern_row
        }
    ]
    for (let {positions, pattern} of checks) {
        for (let p of positions) {
            const ent = world.qo(new OnBoard(from_v(p)))
            const column = relative(ent, [], pattern)
            const types = column.filter(ent => ent.get(CardType) === E_CardType.coin && !ent.get(CardVariant))
            if (types.length !== 3)
                continue
            for_update.push(...column)
        }
    }
    if (for_update.length)
        await sleep(650)

    const unique_ids = []
    const uniques = []
    for (let ent of for_update) {
        if (in_array(unique_ids, ent.id))
            continue
        uniques.push(ent)
        unique_ids.push(ent.id)
    }

    uniques.forEach(ent => {
        ent.add(new CardVariant('ruby'))
        ent.modify(Value).mul(7)
        flip_card(q('#card-' + ent.get(OnBoard)))
    })
}


const check_mobs_between_coins = async () => {
    let for_update = []
    const checks = [
        {
            positions: [[0, 0], [1, 0], [2, 0]],
            pattern: pattern_col
        },
        {
            positions: [[0, 0], [0, 1], [0, 2]],
            pattern: pattern_row
        }
    ]
    for (let {positions, pattern} of checks) {
        for (let p of positions) {
            const ent = world.qo(new OnBoard(from_v(p)))
            const column = relative(ent, [], pattern)
            const is_coin = ent => ent.get(CardType) === E_CardType.coin && !ent.get(CardVariant)
            const is_mob = ent => ent.get(CardType) === E_CardType.mob

            if (!(is_coin(column[0]) && is_mob(column[1]) && is_coin(column[2])))
                continue
            for_update.push(column[1])
        }
    }
    if (for_update.length)
        await sleep(350)

    for (const ent of for_update) {
        half_or_kill(ent)
        anim_deal_damage(ent)
        await sleep(50)
    }
}

const process_event = async (data) => {
    if (!is_available())
        return
    set_unavailable()


    const delay = await process(data)


    if (delay === undefined) {

        await check_mobs_between_coins()
        await check_coins_row()
        set_available()
    }
    if (delay >= 0) {
        console.log('MYDEL', delay)
        setTimeout(async () => {
            await check_mobs_between_coins()
            await check_coins_row()
            set_available()
        }, delay + 5)
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
        [E_CardType.weapon, 'weapon'],
        [E_CardType.crate, 'misc'],
        [E_CardType.coin, 'misc'],
        [E_CardType.mob, 'mob']
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
    for (let i = 0; i < cards_amount; i++) {
        const targets = q('#card-' + i)
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
    console.log('START TURN')
    actions.start_turn()

    actions.ensure_active_item()
    if (actions.ensure_faded()) {
        anim_faded()
        await sleep(200)
    }

    // await check_dead()
    anim_swipe_points()
    anim_hand_selection()
    set_available()
}
const flip_all = async () => {
    const numbers = shuffleArray([...range(0, cards_amount)])
    for (let i of numbers) {
        const card = document.querySelector('#card-' + i)
        flip_card(card)
        await sleep(15)
    }
}

const move_deck = async () => {

    for (let x = 2; x >= 0; x--) {
        actions.consume_card(x)
        await sleep(155)

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
        }
    }

    anime.set('.board', {
        translateY: -margin - 10
    })

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
        }
    }

    anime({
        targets: '.card-board',
        easing: 'easeOutSine',
        opacity: 1,
        duration: 100,
    })

    anime({
        targets: '.board',
        easing: 'easeOutBack',
        translateY: 0,
        duration: 300,
    })
}


const end_turn = async () => {
    if (!is_available())
        return
    console.log('end turn')
    set_unavailable()
    await sleep(20)


    actions.remove_faded()
    anim_faded()
    await sleep(50)

    if (actions.trigger_on_end_turn()) {
        if (check_dead())
            await sleep(350 + 400)
        else
            await sleep(350)
    }

    const pd = get_godlike.player_data()
    pd.swipe_points = pd.swipe_points_max

    await move_deck()

    console.log('PD', get_godlike.player_data())
    const activate_poison_anim = actions.apply_poison()
    if (activate_poison_anim) {
        await sleep(200)
        anim_hero_take_damage()
        anim_poison()
        // await sleep(350)
    } else {
        anim_poison()
    }

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
        delay: 0
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