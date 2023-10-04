import {getRandomChoice, round} from "../game/helpers";
import {purge, world_global} from "../global/create_world";
import {GeneratorData, GodLike, LevelData, RunData} from "../game/components";
import {one_v2} from "../game/rng";
import {show_debug_data} from "../debug";
import {init_route} from "../routing";
import routes from "../routes";


const test_gen_one = () => {
    const mul_by_variant = {
        'mace': 4,
        'whip': 3,
        'sword': 1
    }

    // const amounts: any[] = [
    //     ['mob', 47 - 0],
    //     ['food', 13],
    //     ['weapon', 15 + 0]
    // ]
    const amounts: any[] = [
        ['mob', 5],
        ['food', 5],
        ['weapon', 2]
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
    console.log(cards)

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
        bad_percent = target//data.percent.bad_percent
    }
    return data
}


const get_exp_function = (segment) => {
    const {region, exp} = segment
    return (lvl) => {

        const region_length = region[1] - region[0] + 1
        let step
        if (region_length === 1)
            step = 0
        else
            step = (exp[1] - exp[0]) / (region_length - 1)

        const x = exp[0] + step * (lvl - region[0])
        const value = Math.exp(x) + 1
        return round(value)
    }
}


const segments = [
    {
        region: [1, 1],
        exp: [-3, -3],
        mobs: {
            common: ['spider'],
            rare: ['rat']
        },
        weapons: {
            common: ['sword'],
            rare: ['mace']
        }
    },
    {
        region: [2, 15],
        exp: [-3, 0.27],
        mobs: {
            common: ['pharaoh', 'phoenix'],
            rare: ['rat', 'worm'],
            legend: ['dragon']
        },
        weapons: {
            common: ['sword', 'stick'],
            rare: ['mace', 'whip', 'scythe'],
            legend: ['frying_pan', 'nunchaku']
        }
    },
    {
        region: [16, 35],
        exp: [0.27, 2],
        mobs: {
            common: ['gorilla', 'dwarf', 'worm', 'rat', 'pharaoh'],
            rare: ['elf', 'orc', 'phoenix'],
            legend: ['dragon', 'lych']
        },
        weapons: {
            common: ['sword', 'whip'],
            rare: ['mace', 'shovel', 'scythe', 'spear', 'rake'],
            legend: ['frying_pan', 'katana']
        }
    },
    {
        region: [36, 65],
        exp: [2.1, 2.5],
        mobs: {
            common: ['gorilla', 'dwarf', 'worm', 'rat', 'pharaoh'],
            rare: ['elf', 'orc', 'phoenix', 'golem'],
            legend: ['lych', 'necromancer']
        },
        weapons: {
            common: ['sword',  'mace', 'shuriken'],
            rare: ['dagger', 'crowbar', 'nunchaku'],
            legend: ['knuckles', 'katana']
        }
    },
    {
        region: [66, 90],
        exp: [2.4, 3],
        mobs: {
            common: ['golem', 'dwarf', 'worm', 'rat', 'phoenix'],
            rare: ['elf', 'orc', 'pharaoh',  'gorilla', 'dragon'],
            legend: ['lych', 'necromancer']
        },
        weapons: {
            common: ['whip',  'mace', 'dagger'],
            rare: ['shuriken', 'shovel', 'spear', 'crowbar'],
            legend: ['knuckles', 'rake']
        }
    },
    {
        region: [91, 100],
        exp: [3, 3.3],
        mobs: {
            common: ['golem', 'dwarf', 'worm', 'pharaoh', 'lych'],
            rare: ['devil', 'orc', 'pharaoh', 'rat', 'golem'],
            legend: ['necromancer', 'dragon']
        },
        weapons: {
            common: ['whip',  'mace', 'spear'],
            rare: ['shuriken', 'shovel', 'dagger', 'crowbar', 'katana'],
            legend: ['knuckles', 'rake']
        }
    },
]

export const print_segments = () => {
    for (let segment of segments) {
        const func = get_exp_function(segment)
        const {region} = segment
        for (let i = region[0]; i <= region[1]; i ++) {
            console.log(i, func(i))
        }
    }
}

export const get_segment = (lvl) => {
    for (let segment of segments) {
        const [start, end] = segment.region
        if (start >= lvl && lvl <= end)
            return segment
    }
}

export const get_run_data = () => {
    const ent = world_global.qo(RunData)
    if (ent === undefined)
        return undefined
    return ent.get(RunData)
}

const generate_probabilities_mob = (data, basic: string) => {
    const common = getRandomChoice(data.common)
    const rare = getRandomChoice(data.rare)
    if (data.legend === undefined) {
        return [
            [50, basic],
            [30, common],
            [20, rare]
        ]
    }

    const legend = getRandomChoice(data.legend)
    return [
        [50, basic],
        [30, common],
        [19, rare],
        [1, legend]
    ]
}

const generate_probabilities_weapon = (data, basic: string) => {
    if (data.legend === undefined) {
        return [
            [20, basic],
            [30, getRandomChoice(data.common)],
            [30, getRandomChoice(data.common)],
            [10, getRandomChoice(data.rare)],
            [10, getRandomChoice(data.rare)],
        ]
    }

    const legend = getRandomChoice(data.legend)
    return [
        [20, basic],
        [30, getRandomChoice(data.common)],
        [30, getRandomChoice(data.common)],
        [10, getRandomChoice(data.rare)],
        [9, getRandomChoice(data.rare)],
        [1, legend]
    ]
}

const generate_cards = (current_level) => {
    const segment = get_segment(current_level)
    const exp_function = get_exp_function(segment)
    const {mobs, weapons} = segment

    const  level_probabilities = new Map([
        ['mob', generate_probabilities_mob(mobs, 'spider')],
        ['food', [
            [80, 'apple'],
            [20, 'omlet'],
        ]],
        ['weapon', generate_probabilities_weapon(weapons, 'sword')]
    ])
    console.log(exp_function(current_level))

    purge(GeneratorData)
    world_global.qo(GodLike).add(
        new GeneratorData({
            multiplier: exp_function(current_level),
            level_probabilities
        }))

    return test_gen()
}



export const init_run = async () => {
    const run_data = get_run_data()


    const {current_level} = run_data

    const cards = generate_cards(current_level)
    console.log(cards)
    purge(LevelData)
    const segment = get_segment(current_level)
    const exp_function = get_exp_function(segment)

    world_global.qo(GodLike).add(
        new LevelData({
            cards,
            player: {
                hp: run_data.hp,//Math.round( * exp_function(current_level)),
                hp_max: run_data.hp_max//Math.round( * exp_function(current_level)),
            }
        }))



}