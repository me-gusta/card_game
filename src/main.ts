import anime from 'animejs/lib/anime.es.js';
import {flip_card} from "./animations/flip";
import {img_css, new_element, sleep} from "./animations/helpers";
import {getRandomInt, in_array, range, round, shuffleArray} from "./game/helpers";
import {attacking_card, bounce_card, collect_card} from "./animations/interactions";
import {recreate_world} from "./game/create_world";
import create from "./game/create";
import {one_v2} from "./game/rng";
import actions from "./game/actions";

const app = document.querySelector('#app')

const board = document.querySelector('.board')


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
        complete: () => {
        }
    })

}

const card_click = (card: HTMLElement) => {
    const in_hand = card.id.includes('hand')
    console.log('click card', in_hand)
    // bounce_card(card)
    // choose_card(card)
    if (in_hand)
        choose_card(card)
    else
        collect_card(card)
}

const create_card = (cfg: { i, img?, value? }) => {
    const {i, img, value} = cfg
    const card = new_element(`<div class="card" id="card-${i}"></div>`)

    card.onclick = () => {
        card_click(card)
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
        'background-image': img ? img_css(img) : ''
    })

    elem_img.appendChild(icon)

    if (value) {
        const elem_value = new_element(`<div class="card-content card-value">${value}</div>`, {
            perspective: 200,
        })
        elem_img.appendChild(elem_value)
    }

    return wrap
}


const create_card_empty = (i) => {
    return new_element(`
    <div class="card-wrap empty">
        <div class="card empty" id="card-${i}"></div>
    </div>`)
}

const create_board = () => {
    for (let i = 0; i < 12; i++) {
        board.appendChild(
            create_card({
                i: i,
                img: '',
            })
        )
    }
}


const create_hand = () => {
    const hand = document.querySelector('.hand')
    for (let i = 0; i < 3; i++) {
        const card = i == 1 ? create_card_empty('hand' + i) : create_card({
            i: 'hand' + i,
            img: 'weapons/sword',
            value: 6
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

const test_gen_one =() => {
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
        // console.log('generate', amount, type)
        for (let i =0 ; i < amount; i++) {
            const gen = one_v2(type)
            const mul = mul_by_variant[gen.variant] || 1
            sum[gen.type] += gen.value * mul
            cards.push(gen)
            // console.log(gen)
        }
    }
    // console.log(sum)

    const good = sum.food + sum.weapon
    const bad = sum.mob
    const total = good + bad
    const bad_percent = round(bad / total, 2)
    const good_percent = round(good / total)
    // console.log({bad, good})
    // console.log({bad_percent, good_percent})
    show_debug_data(sum, {bad_percent, good_percent})
    return {cards, percent : {bad_percent, good_percent}}
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
    actions.ensure_active_item()
    // const cards = world.q(CardType, InUpcomingPile).map(ent => ent.get(CardType).toString())
    // console.log(JSON.stringify(cards))
}

const main = () => {
    setup()


    create_board()
    create_hand()

    document.querySelector('.play').addEventListener('click', async () => {
        const numbers = shuffleArray([...range(0, 12)])
        for (let i of numbers) {
            console.log(i)
            const card = document.querySelector('#card-' + i)
            flip_card(card)
            await sleep(50)
        }
    })
}

main()