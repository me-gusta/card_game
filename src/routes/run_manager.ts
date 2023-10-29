import {getRandomChoice, round} from "../game/helpers";
import {extract, purge, world_global} from "../global/create_world";
import {DevData, GeneratorData, GodLike, LevelData, RunData} from "../game/components";
import {one_v2} from "../game/rng";
import {show_debug_data} from "../debug";
import {init_route} from "../routing";
import routes from "../routes";
import {lib_mobs, lib_themes, lib_weapons} from "../global/libs";


// generate a set of cards
const test_gen_one = () => {
    const mul_by_variant = {
        'mace': 4,
        'whip': 3,
        'sword': 1
    }

    const amounts: any[] = [
        ['mob', 46],
        ['food', 13],
        ['weapon', 16]
    ]
    // const amounts: any[] = [
    //     ['mob', 3],
    //     ['food', 3],
    //     ['weapon', 3]
    // ]

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

// generate a set of cards with certain bad/good ration
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
        theme: lib_themes.dungeon,
        mobs_basic: [
            lib_mobs.spider,
            lib_mobs.bat,
            lib_mobs.frog
        ],
        mobs: {
            common: [lib_mobs.hound],
            rare: [lib_mobs.rat]
        },
        weapons: {
            common: [lib_weapons.sword],
            rare: [lib_weapons.mace]
        }
    },
    {
        region: [2, 15],
        exp: [-3, 0.27],
        theme: lib_themes.dungeon,
        mobs_basic: [
            lib_mobs.spider,
            lib_mobs.bat,
            lib_mobs.frog
        ],
        mobs: {
            common: [lib_mobs.hound, lib_mobs.zombie],
            rare: [lib_mobs.rat, lib_mobs.worm],
            legend: [lib_mobs.dragon]
        },
        weapons: {
            common: [lib_weapons.sword, lib_weapons.stick],
            rare: [lib_weapons.mace, lib_weapons.whip, lib_weapons.scythe],
            legend: [lib_weapons.frying_pan, lib_weapons.nunchaku]
        }
    },
    {
        region: [16, 35],
        exp: [0.27, 2],
        theme: lib_themes.sea,
        mobs_basic: [
            lib_mobs.snake,
            lib_mobs.vulture,
            lib_mobs.skeleton
        ],
        mobs: {
            common: [lib_mobs.cyclops, lib_mobs.gorgon, lib_mobs.worm, lib_mobs.hound, lib_mobs.hound],
            rare: [lib_mobs.ghost, lib_mobs.minotaur, lib_mobs.golem],
            legend: [lib_mobs.dragon]
        },
        weapons: {
            common: [lib_weapons.sword, lib_weapons.whip],
            rare: [
                lib_weapons.mace,
                lib_weapons.shovel,
                lib_weapons.scythe,
                lib_weapons.spear,
                lib_weapons.rake
            ],
            legend: [
                lib_weapons.frying_pan,
                lib_weapons.katana
            ]
        }
    },
    {
        region: [36, 65],
        exp: [2.1, 2.5],
        theme: lib_themes.sea,
        mobs_basic: [
            lib_mobs.snake,
            lib_mobs.vulture,
            lib_mobs.skeleton
        ],
        mobs: {
            common: ['gorilla', 'dwarf', 'worm', 'rat', 'pharaoh'],
            rare: ['elf', 'orc', 'phoenix', 'golem'],
            legend: ['lych', 'necromancer']
        },
        weapons: {
            common: ['sword', 'mace', 'shuriken'],
            rare: ['dagger', 'crowbar', 'nunchaku'],
            legend: ['knuckles', 'katana']
        }
    },
    {
        region: [66, 90],
        exp: [2.4, 3],
        theme: lib_themes.hell,
        mobs_basic: [
            lib_mobs.imp,
            lib_mobs.martyr,
            lib_mobs.headless
        ],
        mobs: {
            common: ['golem', 'dwarf', 'worm', 'rat', 'phoenix'],
            rare: ['elf', 'orc', 'pharaoh', 'gorilla', 'dragon'],
            legend: ['lych', 'necromancer']
        },
        weapons: {
            common: ['whip', 'mace', 'dagger'],
            rare: ['shuriken', 'shovel', 'spear', 'crowbar'],
            legend: ['knuckles', 'rake']
        }
    },
    {
        region: [91, 100],
        exp: [3, 3.3],
        theme: lib_themes.hell,
        mobs_basic: [
            lib_mobs.imp,
            lib_mobs.martyr,
            lib_mobs.headless
        ],
        mobs: {
            common: ['golem', 'dwarf', 'worm', 'pharaoh', 'lych'],
            rare: ['devil', 'orc', 'pharaoh', 'rat', 'golem'],
            legend: ['necromancer', 'dragon']
        },
        weapons: {
            common: ['whip', 'mace', 'spear'],
            rare: ['shuriken', 'shovel', 'dagger', 'crowbar', 'katana'],
            legend: ['knuckles', 'rake']
        }
    },
]

export const print_segments = () => {
    for (let segment of segments) {
        const func = get_exp_function(segment)
        const {region} = segment
        for (let i = region[0]; i <= region[1]; i++) {
            console.log(i, func(i))
        }
    }
}

export const get_segment = (lvl) => {
    for (let segment of segments) {
        const [start, end] = segment.region
        console.log('check reg', start, lvl, end)
        if (start <= lvl && lvl <= end)
            return segment
    }
}


const generate_probabilities_mob = (data, basic: string) => {
    const common = getRandomChoice(data.common)
    const rare = getRandomChoice(data.rare)
    if (data.legend === undefined) {
        return [
            [70, basic],
            [20, common],
            [10, rare]
        ]
    }

    const legend = getRandomChoice(data.legend)
    return [
        [70, basic],
        [20, common],
        [9, rare],
        [1, legend]
    ]
}

const generate_probabilities_weapon = (data, basic: string) => {
    if (data.legend === undefined) {
        return [
            [35, basic],
            [30, getRandomChoice(data.common)],
            [20, getRandomChoice(data.common)],
            [10, getRandomChoice(data.rare)],
            [5, getRandomChoice(data.rare)],
        ]
    }

    const legend = getRandomChoice(data.legend)
    return [
        [34, basic],
        [30, getRandomChoice(data.common)],
        [20, getRandomChoice(data.common)],
        [10, getRandomChoice(data.rare)],
        [5, getRandomChoice(data.rare)],
        [1, legend]
    ]
}

const get_prob_mobs_dev = () => {
    const dd = extract(DevData)

    return [
        [50, dd.common_1],
        [30, dd.common_2],
        [20, dd.rare]
    ]
}

const generate_cards = (current_level) => {
    const segment = get_segment(current_level)
    const exp_function = get_exp_function(segment)
    const {mobs, weapons, mobs_basic} = segment

    const dd = extract(DevData)

    let prob_mobs
    let prob_weapons
    if (dd && dd.is_gen) {
        prob_mobs = get_prob_mobs_dev()
        prob_weapons = [
            [100, dd.weapon],
        ]
    } else {
        prob_mobs = generate_probabilities_mob(mobs, getRandomChoice(mobs_basic))
        prob_weapons = generate_probabilities_weapon(weapons, 'sword')
    }


    console.log('current_level', current_level)
    console.log('mobs', mobs)


    const level_probabilities = new Map([
        ['mob', prob_mobs],
        ['food', [
            [80, 'apple'],
            [20, 'omlet'],
        ]],
        ['weapon', prob_weapons]
    ])

    purge(GeneratorData)
    world_global.qo(GodLike).add(
        new GeneratorData({
            multiplier: exp_function(current_level),
            level_probabilities
        }))

    return test_gen()
}

export const init_run = async () => {
    const run_data = extract(RunData)


    const {current_level, theme, hp, hp_max} = run_data

    const cards = generate_cards(current_level)
    console.log(cards)
    purge(LevelData)
    const segment = get_segment(current_level)
    const exp_function = get_exp_function(segment)

    world_global.qo(GodLike).add(
        new LevelData({
            cards,
            player: {
                hp,
                hp_max
            },
            choices: {
                hp: 0,
                weapon: 0,
                heal: 0
            },
            theme
        }))

}