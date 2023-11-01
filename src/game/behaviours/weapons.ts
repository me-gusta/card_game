import type {Entity} from "../../ecw/entity";
import {CardType, CardVariant, E_CardType, InLootPile, LootId, OnBoard, Value} from "../components";
import {
    pattern_around,
    pattern_chess,
    pattern_closest,
    pattern_col,
    pattern_farthest,
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
import {anim_deal_damage, anim_hero_take_damage} from "../../animations/interactions";
import actions from "../actions";
import {lib_spells, lib_weapons} from "../../global/libs";
import {flip_entity} from "../../animations/flip";

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
    [lib_weapons.sword, {
        value_range: [3, 14],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.mace, {
        value_range: [3, 10],
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
    [lib_weapons.scythe, {
        value_range: [5, 10],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_row).forEach(ent => {
                ent.modify(Value).sub(dmg)
                anim_deal_damage(ent)
            })
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.whip, {
        value_range: [2, 11],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            relative(target, [], pattern_col).forEach(ent => {
                ent.modify(Value).sub(dmg)
                anim_deal_damage(ent)
            })
            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.shuriken, {
        value_range: [2, 9],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            let target_two
            shuffleArray(world.q(OnBoard)).forEach(ent => {
                if (ent.id !== target.id)
                    target_two = ent
            })
            target.modify(Value).sub(dmg)
            anim_deal_damage(target)
            target_two.modify(Value).sub(dmg)
            anim_deal_damage(target_two)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.shovel, {
        value_range: [7, 15],
        pattern: pattern_chess,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.dagger, {
        value_range: [5, 19],
        pattern: pattern_closest,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.frying_pan, {
        value_range: [12, 17],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            const value_target = target.get(Value)
            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            if (target.get(Value) <= 0) {
                if (target.has(LootId)) {
                    const loot = world.qe(target.get(LootId))
                    world.killEntity(loot)
                }
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
    [lib_weapons.stick, {
        value_range: [10, 40],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    [lib_weapons.spear, {
        value_range: [2, 4],
        pattern: pattern_farthest,
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.knuckles, {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            target.modify(Value).sub(dmg)
            anim_deal_damage(target)

            if (target.get(Value) <= 0) {
                if (target.has(LootId)) {
                    const loot = world.qe(target.get(LootId))
                    if (loot.get(CardType) === E_CardType.coin)
                        loot.modify(Value).mul(15)
                } else {
                    const coin = create.coin()
                    coin.modify(Value).mul(15)
                    coin.add(new InLootPile())
                    target.add(new LootId(coin.id))
                }
            }

            actor.modify(Value).sub(dmg)
        },
        description: '',
    }],
    [lib_weapons.crowbar, {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            if (target.get(CardType) === E_CardType.crate) {
                target.modify(Value).set(0)
            } else {
                target.modify(Value).sub(dmg)
                actor.modify(Value).sub(dmg)
            }
            anim_deal_damage(target)

        },
        description: '',
    }],
    [lib_weapons.katana, {
        value_range: [2, 4],
        pattern: [[1, 0], [1, 1]],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)
            console.log(select([], [[1, 0], [1, 1]]))
            select([], [[1, 0], [1, 1]]).forEach(ent => {
                console.log('katana', ent)
                ent.modify(Value).sub(dmg)
                anim_deal_damage(ent)
            })
            actor.modify(Value).sub(dmg)

        },
        description: '',
    }],
    [lib_weapons.nunchaku, {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            target.modify(Value).sub(dmg)
            anim_deal_damage(target)
            actor.modify(Value).sub(dmg)
            if (getRandomInt(0, 1) === 1) {
                const player_data = get_godlike.player_data()
                player_data.hp -= dmg
                anim_hero_take_damage()
            }

        },
        description: '',
    }],
    [lib_weapons.rake, {
        value_range: [2, 4],
        on_choice: (actor: Entity, target: Entity) => {
            const dmg = calc_damage(actor, target)

            if (in_array([E_CardType.food, E_CardType.weapon, E_CardType.coin], target.get(CardType))) {
                const value_remove = actor.get(Value) / 2
                actor.modify(Value).sub(Math.ceil(value_remove))

                const key = target.get(OnBoard)
                actions.consume_card(key)

                const coin = create.coin()
                coin.add(new OnBoard(key))
                flip_entity(coin)

            } else {
                target.modify(Value).sub(dmg)
                actor.modify(Value).sub(dmg)
                anim_deal_damage(target)
            }

        },
        description: '',
    }],

    // spells
    [lib_spells.doubler, {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            target.modify(Value).mul(2)
            actor.modify(Value).set(0)
        },
    }],
    [lib_spells.make_frog, {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            const key = target.get(OnBoard)
            target.remove(OnBoard)

            create.mob('frog', key)
            actor.modify(Value).set(0)

        },
        description: '',
    }],
    [lib_spells.luxury_dinner, {
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
    [lib_spells.liquidate, {
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
    [lib_spells.liquidate, {
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
    [lib_spells.disinfect, {
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
    [lib_spells.harvest, {
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
    [lib_spells.calm_down, {
        value_range: [1, 1],
        on_choice: (actor: Entity, target: Entity) => {
            world.q(OnBoard, new CardType(E_CardType.mob)).forEach(ent => {
                half_or_kill(ent)
            })

            actor.modify(Value).set(0)
        },
        description: '',
    }],
    [lib_spells.grenade, {
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
    [lib_spells.imperfection, {
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
    [lib_spells.blood_donation, {
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
    [lib_spells.grocery, {
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
    [lib_spells.master_key, {
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
    [lib_spells.elementary, {
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
