import type {Entity} from "../../esc/entity";
import {CardType, CardVariant, E_CardType, InLootPile, LootId, OnBoard, Value} from "../components";
import {
    pattern_around,
    pattern_chess,
    pattern_closest,
    pattern_col, pattern_farthest,
    pattern_row,
    relative,
    select
} from "../local_math";
import {world} from "../create_world";
import {getRandomChoice, getRandomInt, in_array, pick_n_random, shuffleArray} from "../helpers";
import create from "../create";
import filters from "../filters";
import {half_or_kill} from "./util";
import get_godlike from "../get_godlike";
import {anim_bounce_card} from "../../animations/interactions";
import actions from "../actions";
import {i18n} from "../../localization";

const calc_damage = (actor, target) => {

    const value = actor.get(Value)
    const value_target = target.get(Value)

    if (value >= value_target) {
        return value_target
    } else {
        return value
    }
}

const anim_deal_damage = (ent) => {
    const key = ent.get(OnBoard)
    const card = document.querySelector('#card-' + key)
    anim_bounce_card(card)
    card.querySelector('.card-value').textContent = ent.get(Value)
}

export const weapons_map = new Map([
    ['sword', {
        value_range: [3, 7],
        // filters: [
        //     filters.is_of_type(E_CardType.mob),
        //     filters.is_of_type(E_CardType.crate),
        //
        // ],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['mace', {
        value_range: [2, 3],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_around).forEach(ent => {
                ent.modify(Value).sub(dmg)
                anim_deal_damage(ent)
            })
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['scythe', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_row).forEach(ent => {
                ent.modify(Value).sub(dmg)
            })
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['whip', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_col).forEach(ent => {
                ent.modify(Value).sub(dmg)
            })
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['shuriken', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            let target_two
            shuffleArray(world.q(OnBoard)).forEach(ent => {
                if (ent.id !== target.id)
                    target_two = ent
            })
            target.modify(Value).sub(dmg)
            target_two.modify(Value).sub(dmg)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['shovel', {
        value_range: [2, 4],
        pattern: pattern_chess,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['dagger', {
        value_range: [2, 4],
        pattern: pattern_closest,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['frying_pan', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            const value_target = target.get(Value)
            target.modify(Value).sub(dmg)

            if (target.get(Value) <= 0) {
                const loot = world.createEntity(
                    new InLootPile(),
                    new Value(value_target),
                    new CardType(E_CardType.food),
                    new CardVariant('omlet'),
                )
                target.add(
                    new LootId(loot.id)
                )
            }
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['stick', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['spear', {
        value_range: [2, 4],
        pattern: pattern_farthest,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['knuckles', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)

            if (target.get(Value) <= 0) {
                if (target.has(LootId)) {
                    const loot = world.qe(target.get(LootId))
                    if (loot.get(CardType) === E_CardType.coin)
                        loot.modify(Value).mul(10)
                }
            }

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    ['crowbar', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            if (target.get(CardType) === E_CardType.crate) {
                target.modify(Value).set(0)
            } else {
                target.modify(Value).sub(dmg)
                actor.modify(Value).sub(dmg)
            }

        },
        description: '',
    }],
    ['katana', {
        value_range: [2, 4],
        pattern: [[1, 1], [1, 2]],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            select([], [[1, 1], [1, 2]]).forEach(ent => {

                ent.modify(Value).sub(dmg)
            })
            actor.modify(Value).sub(dmg)

        },
        description: '',
    }],
    ['nunchaku', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            actor.modify(Value).sub(dmg)
            if (getRandomInt(0, 1) === 1) {
                const player_data = get_godlike.player_data()
                player_data.hp -= dmg
            }

        },
        description: '',
    }],
    ['rake', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            if (in_array([E_CardType.food, E_CardType.weapon], target.get(CardType))) {
                const value_target = target.get(Value)
                actor.modify(Value).sub(Math.floor(value_target / 2))

                actions.consume_card(target.get(OnBoard))
            } else {
                target.modify(Value).sub(dmg)
                actor.modify(Value).sub(dmg)
            }

        },
        description: '',
    }],

    // spells
    ['doubler', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            target.modify(Value).mul(2)
            actor.modify(Value).set(0)
        },
    }],
    ['make_moose', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            const key = target.get(OnBoard)
            target.remove(OnBoard)

            create.mob('moose', key)
            actor.modify(Value).set(0)

        },
        description: '',
    }],
    ['luxury_dinner', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.food)
        ],
        on_choice: (actor: Entity, target: Entity) => {
            const food = world.q(OnBoard, new CardType(E_CardType.food))
            pick_n_random(3, food).forEach(ent => {

                const key = ent.get(OnBoard)
                ent.remove(OnBoard)
                world.createEntity(
                    new OnBoard(key),
                    new Value(getRandomInt(3, 7)),
                    new CardType(E_CardType.coin),
                )
            })
            actor.modify(Value).set(0)

        },
        description: '',
    }],
    ['liquidate', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.mob),
        ],
        on_choice: (actor: Entity, target: Entity) => {
            const enemy = getRandomChoice(
                world.q(OnBoard, new CardType(E_CardType.mob))
            )
            enemy.modify(Value).set(0)
            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['recruit', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.mob),
        ],
        on_choice: (actor: Entity, target: Entity) => {

            const key = target.get(OnBoard)
            const value = target.get(Value)
            const variant = getRandomChoice(
                ['sword', 'mace', 'whip']
            )
            target.remove(OnBoard)

            world.createEntity(
                new OnBoard(key),
                new Value(value),
                new CardType(E_CardType.weapon),
                new CardVariant(variant),
            )

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['disinfect', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.mob).and(
                filters.value_lt(5)
            )
        ],
        on_choice: (actor: Entity, target: Entity) => {

            select(
                [
                    filters.is_of_type(E_CardType.mob).and(
                        filters.value_lt(5)
                    )
                ]
            ).forEach(ent => {
                ent.modify(Value).set(0)
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['harvest', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            pick_n_random(3, world.q(OnBoard)).forEach(ent => {
                const key = ent.get(OnBoard)
                ent.remove(OnBoard)

                world.createEntity(
                    new OnBoard(key),
                    new Value(3),
                    new CardType(E_CardType.food),
                    new CardVariant('apple'),
                )
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['calm_down', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            world.q(OnBoard, new CardType(E_CardType.mob)).forEach(ent => {
                half_or_kill(ent)
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['grenade', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.weapon)
        ],
        on_choice: (actor: Entity, target: Entity) => {
            const value = actor.get(Value)
            relative(target, [], pattern_around).forEach(ent => {
                ent.modify(Value).sub(value)
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['imperfection', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            let c = 0
            const on_board = world.q(OnBoard)
            on_board.forEach(ent => {
                if (c >= on_board.length - 1) return
                const key = ent.get(OnBoard)
                ent.remove(OnBoard)
                world.createEntity(
                    new OnBoard(key),
                    new Value(getRandomInt(3, 7)),
                    new CardType(E_CardType.coin),
                )
                c++
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['blood_donation', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            const player = get_godlike.player_data()
            world.q(OnBoard, new CardType(E_CardType.mob)).forEach(ent => {
                ent.modify(Value).sub(1)
                player.hp = Math.min(
                    player.hp + 1, player.hp_max
                )
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['grocery', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.coin)
        ],
        on_choice: (actor: Entity, target: Entity) => {
            const value = target.get(Value)
            const key = target.get(OnBoard)
            target.remove(OnBoard)

            world.createEntity(
                new OnBoard(key),
                new Value(value),
                new CardType(E_CardType.food),
                new CardVariant('omlet'),
            )

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['master_key', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.crate)
        ],
        on_choice: (actor: Entity, target: Entity) => {
            if (target.has(LootId)) {
                const loot_card = world.qe(target.get(LootId))
                loot_card.modify(Value).mul(2)
            }
            target.modify(Value).set(0)

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    ['elementary', {
        value_range: [1, 1],
        filters: [
            filters.is_of_type(E_CardType.coin),
            filters.is_of_type(E_CardType.food),
        ],
        on_choice: (actor: Entity, target: Entity) => {
            target.modify(Value).mul(4)

            actor.modify(Value).set(0)
        },
        description: '',
    }],
])
