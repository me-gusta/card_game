import * as _ from "lodash/fp";
import {getRandomInt, in_array, shuffleArray} from "./helpers";
import {card_variations_map, get_map_entry} from "./rng";


const insert_proportionally = (a, b) => {
    const each = Math.floor(a.length / b.length)

    console.log('%c START insert_proportionally', 'color: orange')
    console.log('b', b.length, b)
    console.log('into')
    console.log('a', a.length, a)
    console.log('each', each)
    const len_b = b.length

    const index_max = a.length - 1
    for (let i = 0; i < len_b; i++) {
        const start = index_max - (i * each)
        const end = index_max - ((i + 1) * each) + 1
        const index = getRandomInt(start, end)
        a.splice(index, 0, b.pop())
    }
    console.log('%c END insert_proportionally', 'color: orange')
}

const gen_one_card = (variant) => {
    const type = card_variations_map.get(variant)
    if (type === undefined)
        throw `CARD "${variant}" IS UNKNOWN. PLS ADD IT TO LIBRARY`
    const {value_range} = get_map_entry(type, variant)
    const value = Math.round(
        getRandomInt(...value_range)
    )
    return {
        variant,
        type,
        value
    }
}

const gen_mobs = (prob_map, amount_total) => {
    const out = []
    for (let [variant, percent] of Object.entries(prob_map)) {
        if (!percent)
            continue
        percent = Number(percent)
        const amount = Math.floor((percent / 100) * amount_total)
        const cards = []

        for (let i of _.range(0, amount)) {
            cards.push(gen_one_card(variant))
        }
        out.push(...cards)
    }
    return out
}

const insert_with_safe_zone = (where, what, percent) => {
    const index_safe = Math.floor(percent * where.length)
    const safe = where.slice(0, index_safe)
    const danger = where.slice(index_safe)
    console.log('index_safe:', index_safe)

    insert_proportionally(danger, what)
    return [...safe, ...danger]
}



export const generate = (gen_data) => {
    const g = gen_data

    const mobs_relation = 0.7
    const go_last_mobs = ['zombie']
    const go_last_weapons = ['stick']

    console.log('%c GENERATOR', 'background: #222; color: #bada55; font-size: 20px')

    // generate mobs
    const amount_mobs_basic = Math.floor(g.amounts['mob'] * mobs_relation)
    const amount_mobs_special = g.amounts['mob'] - amount_mobs_basic
    console.log(`Generating mobs: ${amount_mobs_basic} basic + ${amount_mobs_special} special`)

    let mobs_basic = gen_mobs(g.mobs['basic'], amount_mobs_basic)
    let [mobs_last, mobs_special] = _.partition(
        x => in_array(go_last_mobs, x['variant']),
        gen_mobs(g.mobs['special'], amount_mobs_special)
    )

    console.log(mobs_basic)
    console.log(mobs_last, mobs_special)


    // Find basic mobs with most %
    const mob_most_popular = Object.entries(g.mobs['basic']).sort((a, b) => {
        const percent_a = Number(a[1])
        const percent_b = Number(b[1])
        return percent_b - percent_a
    })[0][0]
    const current_amount = mobs_basic.length + mobs_last.length + mobs_special.length
    console.log('current_amount', current_amount, g.amounts['mob'] - current_amount)
    for (let i of _.range(0, g.amounts['mob'] - current_amount)) {
        mobs_basic.push(gen_one_card(mob_most_popular))
    }

    // add dangerous mobs to the end
    console.log('Insert 1. mobs')
    let mobs_tmp = [...mobs_basic, ...mobs_special]
    shuffleArray(mobs_tmp)


    let mobs_all = insert_with_safe_zone(mobs_tmp, mobs_last, 0.3)
    console.log('mobs_all:', mobs_all)


    // gen weapons
    // gen weapons_last
    let weapons_basic = []
    let weapons_special = []
    let weapons_last = []

    for (let [variant, amount] of Object.entries(g.weapons)) {
        for (let i = 0; i < amount; i++) {
            const card = gen_one_card(variant)
            if (in_array(go_last_weapons, variant)) {
                weapons_last.push(card)
            } else {
                weapons_special.push(card)
            }
        }
    }

    const weapons_special_amount = weapons_special.length + weapons_last.length
    const weapons_basic_amount = g.amounts['weapon'] - weapons_special_amount

    for (let i = 0; i < weapons_basic_amount; i++) {
        weapons_basic.push(gen_one_card('sword'))
    }

    shuffleArray(weapons_basic)
    shuffleArray(weapons_special)
    shuffleArray(weapons_last)

    console.log('WEAPONS GENERATED')
    console.log(weapons_special)
    console.log(weapons_last)
    console.log(weapons_basic)

    // gen food
    let food = []
    let food_amounts = {}
    for (let [variant, percent] of Object.entries(g.food)) {
        food_amounts[variant] = Math.floor(g.amounts['food'] * (percent / 100))
    }
    // upper loop can leave us with food amount which is less than in g.amounts.
    // so we add remaining amount for first entry in food_amount
    food_amounts[Object.entries(food_amounts)[0][0]] += g.amounts['food'] - Object.values(food_amounts).reduce((a, b) => a + b)

    for (let [variant, amount] of Object.entries(food_amounts)) {
        for (let i = 0; i < amount; i++) {
            food.push(gen_one_card(variant))
        }
    }
    shuffleArray(food)

    console.log('FOOD GENERATED')
    console.log(food)
    console.log(food_amounts)

    let cards = [...mobs_all]

    // Add 1 sword to first 6 cells
    cards.splice(getRandomInt(0, 5), 0, weapons_basic.pop())
    // shuffle good
    const good = [...weapons_basic, ...weapons_special, ...food]
    shuffleArray(good)

    let next_div = getRandomInt(3, 4)
    for (let i = cards.length - 1; i > 0; i--) {
        if (i % next_div === 0) {
            cards.splice(i, 0, good.pop())
            next_div = getRandomInt(3, 4)
        }
    }

    insert_proportionally(cards, good)
    cards = insert_with_safe_zone(cards, weapons_last, 0.4)

    console.log('CARDS')
    console.log(cards)
    // make path of good
    // insert 1 good at start

    // insert rest of good proportionally
    // insert weapons_last proportionally
    console.log('%c GENERATOR END', 'background: #222; color: #bada55; font-size: 20px')
    return cards
}
