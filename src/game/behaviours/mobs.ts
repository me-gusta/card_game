// on_attack
// on_swipe
// on_consume

import type {Entity} from "../../esc/entity";
import get_godlike from "../get_godlike";
import {
    CARD_TYPE_VALUABLE,
    CardType,
    CardVariant,
    E_CardType,
    EffectPoisoned,
    OnBoard,
    OnCardAttacked,
    OnSwap,
    OnSwapDisabled,
    OnTurnEnd,
    OnTurnStart,
    Value
} from "../components";
import {world} from "../create_world";
import {getRandomChoice, in_array} from "../helpers";
import {pattern_around, relative} from "../local_math";
import create from "../create";
import {half_or_kill} from "./util";


export const mobs_map = new Map([
    ['spider', {
        value_range: [2, 5]
    }],
    ['imp', {
        value_range: [2, 5]
    }],
    ['moose', {
        value_range: [1, 1]
    }],
    ['rat', {
        value_range: [3, 7],
        on_consume: (actor: Entity) => {
            const value = actor.get(Value)
            const godlike = get_godlike.godlike()
            if (godlike.has(EffectPoisoned))
                godlike.modify(EffectPoisoned).add(value)
            else
                godlike.add(new EffectPoisoned(value))
        }
    }],
    ['gorilla', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            if (other.get(CardType) !== E_CardType.food)
                return

            half_or_kill(actor)
            other.modify(Value).set(0)
        }
    }],
    ['pharaoh', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            half_or_kill(other)
            actor.add(OnSwapDisabled)
        }
    }],
    ['dwarf', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            if (other.get(CardType) !== E_CardType.coin)
                return
            const dmg = Math.floor(other.get(Value) / 2) || 1
            actor.modify(Value).sub(dmg)
            other.modify(Value).set(0)
        }
    }],
    ['phoenix', {
        value_range: [3, 7],
        triggers: [OnTurnEnd],
        on_turn_end: (actor: Entity) => {
            half_or_kill(actor)
        }
    }],
    ['elf', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            const key_actor = actor.get(OnBoard)
            const key_other = other.get(OnBoard)

            other.remove(OnBoard)
            other.add(new OnBoard(key_actor))

            actor.remove(OnBoard)

            const random = getRandomChoice(world.q(OnBoard))

            const key_random = random.get(OnBoard)

            random.remove(OnBoard)
            random.add(new OnBoard(key_other))
            actor.add(new OnBoard(key_random))
        }
    }],
    ['worm', {
        value_range: [3, 7],
        triggers: [OnTurnStart],
        on_turn_start: (actor: Entity) => {
            relative(actor, [], pattern_around).forEach(ent => {
                if (ent.get(CardType) !== E_CardType.food)
                    return
                ent.modify(Value).set(0)
            })
        }
    }],
    ['orc', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            const random = getRandomChoice(
                world.q(
                    OnBoard,
                    new CardType(E_CardType.weapon))
            )
            if (random === undefined)
                return
            random.modify(Value).set(0)
            actor.add(OnSwapDisabled)
        }
    }],
    ['golem', {
        value_range: [3, 7],
        triggers: [OnCardAttacked],
        on_card_attacked: (actor: Entity, target: Entity, weapon: Entity) => {
            console.log(actor.id, target.id, actor.id !== target.id)
            if (actor.id !== target.id) return
            try {
                weapon.modify(Value).set(0)
            } catch (e) {}
        }
    }],
    ['necromancer', {
        value_range: [3, 7],
        triggers: [OnCardAttacked],
        on_card_attacked: (actor: Entity, target: Entity, weapon: Entity) => {
            if (target.get(CardVariant) === 'necromancer') return
            if (target.get(Value) > 0) return
            target.modify(Value).set(1)
        }
    }],
    ['lych', {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            const mobs = world.q(new CardType(E_CardType.mob)).filter(
                ent => ent.id !== actor.id
            )
            const random = getRandomChoice(mobs)
            if (random === undefined) return
            random.modify(Value).mul(2)
            actor.add(OnSwapDisabled)
        }
    }],
    ['dragon', {
        value_range: [3, 7],
        triggers: [OnTurnStart],
        on_turn_start: (actor: Entity) => {
            relative(actor, [], pattern_around).forEach(ent => {
                if (ent.get(CardType) !== E_CardType.coin)
                    return
                const adding = Math.floor(ent.get(Value) / 2)
                actor.modify(Value).add()
                ent.modify(Value).set(0)
            })
        }
    }],
    ['demon', {
        value_range: [3, 7],
        triggers: [OnTurnEnd],
        on_turn_end: (actor: Entity) => {
            const valuables = world.q(OnBoard).filter(
                ent =>
                    in_array(
                        CARD_TYPE_VALUABLE, ent.get(CardType)
                    )
            )

            const random = getRandomChoice(valuables)
            if (random === undefined) return
            const key = random.get(OnBoard)
            random.remove(OnBoard)
            random.modify(Value).set(0)


            create.mob('imp', key)
        }
    }]
])