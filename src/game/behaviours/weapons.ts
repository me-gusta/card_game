import type {Entity} from "../../esc/entity";
import {CardType, CardVariant, E_CardType, InLootPile, LootId, OnBoard, Value} from "../components";
import {pattern_around, pattern_row, relative, select} from "../local_math";
import {world} from "../create_world";
import {getRandomChoice, getRandomInt, pick_n_random} from "../helpers";
import create from "../create";
import filters from "../filters";
import {half_or_kill} from "./util";
import get_godlike from "../get_godlike";

const calc_damage = (actor, target) => {

    const value = actor.get(Value)
    const value_target = target.get(Value)

    if (value >= value_target) {
        return value_target
    } else {
        return value
    }
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
            actor.modify(Value).sub(dmg)
        }
    }],
    ['mace', {
        value_range: [2, 3],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_around).forEach(ent => {
                ent.modify(Value).sub(dmg)
            })
            actor.modify(Value).sub(dmg)
        }
    }],
    ['whip', {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_row).forEach(ent => {
                ent.modify(Value).sub(dmg)
            })
            actor.modify(Value).sub(dmg)
        }
    }],

    // spells
    ['doubler', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            target.modify(Value).mul(2)
            actor.modify(Value).set(0)
        }
    }],
    ['make_moose', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            const key = target.get(OnBoard)
            target.remove(OnBoard)

            create.mob('moose', key)
            actor.modify(Value).set(0)

        }
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

        }
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
        }
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
        }
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
        }
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
        }
    }],
    ['calm_down', {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            world.q(OnBoard, new CardType(E_CardType.mob)).forEach(ent => {
                half_or_kill(ent)
            })

            actor.modify(Value).set(0)
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
    }],
])
