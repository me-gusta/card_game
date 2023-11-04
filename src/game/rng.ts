import {getRandomInt, randomEnum} from "./helpers";
import {E_CardType, GeneratorData} from "./components";
import {mobs_map} from "./behaviours/mobs";
import {weapons_map} from "./behaviours/weapons";
import {food_map} from "./behaviours/food";
import get_godlike from "./get_godlike";
import {world_global} from "../global/create_world";

const card_data = () => {
    let type
    do {
        type = randomEnum(E_CardType)
    } while (type === E_CardType.empty)

    let value = getRandomInt(3, 9)
    let loot = null

    if (getRandomInt(0, 100) < 35) {
        type = E_CardType.mob
        loot = {
            type: E_CardType.coin,
            value: getRandomInt(3, 9)
        }
    }

    if (type === E_CardType.crate) {
        value = getRandomInt(1, 2)
        loot = {
            type: E_CardType.weapon,
            value: getRandomInt(4, 10)
        }
    }


    return {
        type,
        value,
        loot
    }
}

const build_variations_map = (): Map<string, E_CardType> => {
    const map = new Map()
    const variations = [
        [E_CardType.weapon, Array.from(weapons_map.keys())],
        [E_CardType.mob, Array.from(mobs_map.keys())],
        [E_CardType.food, Array.from(food_map.keys())],
    ]
    for (let [type, names] of variations)
        for (let name of names)
            map.set(name, type)
    return map
}

export const card_variations_map = build_variations_map()


export const one = (tag) => {
    const level_probabilities = get_godlike.run_data().level_probabilities
    const probabilities = level_probabilities.get(tag)
    const dice = getRandomInt(1, 100)
    let sum = 0
    for (let [prob, variant] of probabilities) {
        sum += prob
        const type = card_variations_map.get(variant)
        if (type === undefined)
            throw 'CARD IS UNKNOWN. PLS ADD IT TO LIBRARY'
        if (dice <= sum) {
            return {
                variant,
                type
            }
        }
    }
}

const mob = () => {
    return one('mob')
}

const good = () => {
    const is_food = getRandomInt(1, 100) < 30
    if (is_food)
        return one('food')
    else
        return one('weapon')
}

const card = (is_good) => {
    if (is_good)
        return good()
    else
        return mob()
}

export const get_map_entry = (tag, variant) => {
    switch (tag) {
        case 'mob':
            return mobs_map.get(variant)
        case 'food':
            return food_map.get(variant)
        case 'weapon':
            return weapons_map.get(variant)
    }
}

export const one_v2 = (type,) => {
    const generator_data = world_global.qo(GeneratorData).get(GeneratorData)
    const level_probabilities = generator_data.level_probabilities
    const multiplier = generator_data.multiplier
    const probabilities = level_probabilities.get(type)
    const dice = getRandomInt(1, 100)
    let sum = 0
    for (let [prob, variant] of probabilities) {
        sum += prob
        const type = card_variations_map.get(variant)
        if (type === undefined)
            throw `CARD "${variant}" IS UNKNOWN. PLS ADD IT TO LIBRARY`
        if (dice <= sum) {
            const {value_range} = get_map_entry(type, variant)
            const value = Math.round(
                getRandomInt(...value_range) * multiplier
            )
            return {
                variant,
                type,
                value
            }
        }
    }
}

export default {card_data, mob, good, card}