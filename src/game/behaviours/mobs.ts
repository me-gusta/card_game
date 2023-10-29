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
    EffectPoisoned, InUpcomingPile,
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
import {lib_mobs} from "../../global/libs";
import {anim_deal_damage} from "../../animations/interactions";
import {flip_card, flip_entity} from "../../animations/flip";
import {q} from "../../animations/helpers";



export const mobs_map = new Map([
    [lib_mobs.spider, {
        value_range: [2, 5]
    }],
    [lib_mobs.bat, {
        value_range: [2, 5]
    }],
    [lib_mobs.frog, {
        value_range: [2, 5]
    }],

    [lib_mobs.snake, {
        value_range: [2, 5]
    }],
    [lib_mobs.vulture, {
        value_range: [2, 5]
    }],
    [lib_mobs.skeleton, {
        value_range: [2, 5]
    }],


    [lib_mobs.imp, {
        value_range: [2, 5]
    }],
    [lib_mobs.martyr, {
        value_range: [2, 5]
    }],
    [lib_mobs.headless, {
        value_range: [2, 5]
    }],
    [lib_mobs.rat, {
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
    [lib_mobs.cyclops, {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            if (other.get(CardType) !== E_CardType.food)
                return

            half_or_kill(actor)
            other.modify(Value).set(0)
            anim_deal_damage(actor)
        }
    }],
    [lib_mobs.hound, {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            half_or_kill(other)
            anim_deal_damage(other)
            console.log(actor.get(CardVariant), other.get(CardVariant))
            actor.add(OnSwapDisabled)
        }
    }],
    [lib_mobs.gorgon, {
        value_range: [3, 7],
        triggers: [OnSwap],
        on_swap: (actor: Entity, other: Entity) => {
            if (other.get(CardType) !== E_CardType.weapon)
                return
            half_or_kill(actor)
            half_or_kill(other)
            anim_deal_damage(actor)
            anim_deal_damage(other)
            console.log('sada')
        }
    }],
    [lib_mobs.zombie, {
        value_range: [3, 7],
        triggers: [OnTurnEnd],
        on_turn_end: (actor: Entity) => {
            half_or_kill(actor)
            anim_deal_damage(actor)
            return true
        }
    }],
    [lib_mobs.ghost, {
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

            flip_card(q('#card-' + key_random))
        }
    }],
    [lib_mobs.worm, {
        value_range: [3, 7],
        triggers: [OnTurnEnd],
        on_turn_end: (actor: Entity) => {
            let activated = false
            relative(actor, [], pattern_around).forEach(ent => {
                if (ent.get(CardType) !== E_CardType.food)
                    return
                ent.modify(Value).set(0)
                anim_deal_damage(ent)
                activated = true
            })
            return activated
        }
    }],
    [lib_mobs.minotaur, {
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
    [lib_mobs.golem, {
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
    [lib_mobs.necromancer, {
        value_range: [3, 7],
        triggers: [OnCardAttacked],
        on_card_attacked: (actor: Entity, target: Entity, weapon: Entity) => {
            if (target.get(CardVariant) === 'necromancer') return
            if (target.get(Value) > 0) return
            target.modify(Value).set(1)
            flip_entity(target)
        }
    }],
    [lib_mobs.death, {
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
            flip_entity(random)
        }
    }],
    [lib_mobs.dragon, {
        value_range: [3, 7],
        triggers: [OnTurnEnd],
        on_turn_end: (actor: Entity) => {
            let activated = false
            relative(actor, [], pattern_around).forEach(ent => {
                if (ent.get(CardType) !== E_CardType.coin)
                    return
                const value = ent.get(Value)
                const adding = Math.floor(value / 2)
                actor.modify(Value).add(adding)

                const key = ent.get(OnBoard)

                ent.modify(Value).set(0)
                ent.remove(OnBoard)

                world.createEntity(
                    new OnBoard(key),
                    new Value(Math.floor(value / 3)),
                    new CardType(E_CardType.food),
                    new CardVariant('apple'),
                )
                flip_card(q('#card-' + key))

                flip_entity(actor)
                activated = true
            })
            return activated
        }
    }],
    [lib_mobs.devil, {
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
            flip_card(q('#card-' + key))
            return true
        }
    }]
])