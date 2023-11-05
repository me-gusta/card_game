import {getRandomChoice, getRandomInt, in_array, round, shuffleArray} from "../game/helpers";
import {extract, purge, world_global} from "../global/create_world";
import {CardType, DevData, E_CardType, GeneratorData, GodLike, LevelData, RunData} from "../game/components";
import {card_variations_map, get_map_entry, one_v2} from "../game/rng";
import {show_debug_data} from "../debug";
import {init_route} from "../routing";
import routes from "../routes";
import {lib_mobs, lib_themes, lib_weapons} from "../global/libs";
import {mobs_map} from "../game/behaviours/mobs";
import {weapons_map} from "../game/behaviours/weapons";
import * as _ from "lodash/fp";
import {generate} from "../game/level_generator";

const w_gen = {
    "dungeon": [
        {
            "stick": 1,
            "mace": 2,
            "whip": 1,
            "scythe": 2,
        },
        {
            "mace": 1,
            "whip": 2,
            "scythe": 2,
            "frying_pan": 1,
        },
        {
            "mace": 1,
            "whip": 3,
            "scythe": 2,
            "nunchaku": 1
        },
        {
            "mace": 2,
            "whip": 1,
            "scythe": 2,
        }
    ]
}

const m_gen = {
    'dungeon': [
        {
            "basic": {
                "spider": "70",
                "frog": "20",
                "bat": "10"
            },
            "special": {
                "hound": "65",
                "zombie": "",
                "rat": "35",
                "worm": "",
                "dragon": ""
            }
        },
        {
            "basic": {
                "spider": "85",
                "frog": "15",
                "bat": ""
            },
            "special": {
                "hound": "50",
                "zombie": "2",
                "rat": "48",
                "worm": "",
                "dragon": ""
            }
        },
        {
            "basic": {
                "spider": "85",
                "frog": "5",
                "bat": "10"
            },
            "special": {
                "hound": "80",
                "zombie": "10",
                "rat": "10",
                "worm": "",
                "dragon": ""
            }
        },
        {
            "basic": {
                "spider": "80",
                "frog": "15",
                "bat": "5"
            },
            "special": {
                "hound": "70",
                "zombie": "20",
                "rat": "10",
                "worm": "",
                "dragon": ""
            }
        }
    ]
}

const generate_cards = () => {
    const dummy_gen_data = {
        amounts: {
            'mob': 50,
            'food': 11,
            'weapon': 14
        },
        weapons: {
            "stick": 1,
            "mace": 2,
            "whip": 1,
            "scythe": 2,
        },
        food: {
            "apple": 80,
            "omlet": 20,
        },
        mobs: {
            "basic": {
                "spider": 70,
                "frog": 20,
                "bat": 10
            },
            "special": {
                "hound": 20,
                "zombie": "",
                "rat": 80,
                "worm": "",
                "dragon": ""
            }
        }
    }

    const {theme} = extract(RunData)

    const gen_data = {
        amounts: {
            'mob': 50,
            'food': 11,
            'weapon': 14
        },
        food: {
            "apple": 80,
            "omlet": 20,
        },
        weapons: getRandomChoice(w_gen[theme]),
        mobs: getRandomChoice(m_gen[theme])
    }

    return {
        cards: generate(dummy_gen_data)
    }
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
            common: [
                lib_mobs.cyclops,
                lib_mobs.gorgon,
                lib_mobs.worm,
                lib_mobs.rat,
                lib_mobs.hound
            ],
            rare: [
                lib_mobs.ghost,
                lib_mobs.minotaur,
                lib_mobs.zombie,
                lib_mobs.golem],
            legend: [
                lib_mobs.death,
                lib_mobs.necromancer
            ]
        },
        weapons: {
            common: [
                lib_weapons.sword,
                lib_weapons.mace,
                lib_weapons.shuriken
            ],
            rare: [
                lib_weapons.dagger,
                lib_weapons.crowbar,
                lib_weapons.nunchaku
            ],
            legend: [
                lib_weapons.knuckles,
                lib_weapons.katana
            ]
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
            common: [
                lib_mobs.golem,
                lib_mobs.gorgon,
                lib_mobs.worm,
                lib_mobs.rat,
                lib_mobs.zombie
            ],
            rare: [
                lib_mobs.ghost,
                lib_mobs.minotaur,
                lib_mobs.hound,
                lib_mobs.cyclops,
                lib_mobs.dragon
            ],
            legend: [
                lib_mobs.death,
                lib_mobs.necromancer
            ]
        },
        weapons: {
            common: [
                lib_weapons.whip,
                lib_weapons.mace,
                lib_weapons.dagger
            ],
            rare: [
                lib_weapons.shuriken,
                lib_weapons.shovel,
                lib_weapons.spear,
                lib_weapons.crowbar
            ],
            legend: [
                lib_weapons.knuckles,
                lib_weapons.rake
            ]
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
            common: [
                lib_mobs.golem,
                lib_mobs.gorgon,
                lib_mobs.worm,
                lib_mobs.hound,
                lib_mobs.death
            ],
            rare: [
                'devil',
                lib_mobs.minotaur,
                lib_mobs.hound,
                lib_mobs.rat,
                lib_mobs.golem
            ],
            legend: [
                lib_mobs.necromancer,
                lib_mobs.dragon
            ]
        },
        weapons: {
            common: [
                lib_weapons.whip,
                lib_weapons.mace,
                lib_weapons.spear
            ],
            rare: [
                lib_weapons.shuriken,
                lib_weapons.shovel,
                lib_weapons.dagger,
                lib_weapons.crowbar,
                lib_weapons.katana
            ],
            legend: [
                lib_weapons.knuckles,
                lib_weapons.rake
            ]
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


export const init_run = async () => {


    const {current_level, theme, hp, hp_max} = extract(RunData)

    const cards = generate_cards()
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