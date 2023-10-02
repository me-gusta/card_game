import {as_pattern, from_v, select, v} from "./local_math";
import {world} from "./create_world";
import {
    CardType, CardVariant,
    E_CardType,
    E_UI_COMMAND, EffectPoisoned,
    InHand, InLootPile,
    InUpcomingPile, IsChosen, IsFaded, LootId,
    OnBoard, OnSwapDisabled, OnTurnEnd, OnTurnStart,
    Value,
} from "./components";
import get_godlike from "./get_godlike";
import {Vector} from "../esc/vector";
import {weapons_map} from "./behaviours/weapons";
import {in_array} from "./helpers";
import {mobs_map} from "./behaviours/mobs";
import {
    anim_attack_card,
    anim_collect_card,
    anim_fade_card,
    anim_hero_take_damage,
    anim_new_weapon
} from "../animations/interactions";
import {update_card} from "../animations/flip";

const init_board = () => {
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 3; x++) {
            const card_n = from_v(v(x, y))
            const card = world.qo(
                new InUpcomingPile(card_n),
                Value,
                CardType
            )
            card.remove(InUpcomingPile)
            card.add(new OnBoard(card_n))
        }
    }
}

const consume_card = (on_board_id: number) => {
    const card = world.qo(
        new OnBoard(on_board_id),
        Value,
        CardType
    )

    if (card === undefined) return

    const value = card.get(Value)
    const type = card.get(CardType)
    const player = get_godlike.player_data()
    switch (type) {
        case E_CardType.food: {
            player.hp = Math.min(player.hp + value, player.hp_max)
            clear_effects()
            anim_collect_card(card)
            world.killEntity(card)
            break
        }
        case E_CardType.mob: {
            const variant = card.get(CardVariant)
            const {on_consume} = mobs_map.get(variant)
            if (on_consume)
                on_consume(card)
            player.hp -= value
            anim_attack_card(card)
            anim_hero_take_damage()
            world.killEntity(card)
            break
        }
        case E_CardType.coin: {
            player.coins += value
            anim_collect_card(card)
            world.killEntity(card)
            break
        }
        case E_CardType.crate: {
            const loot_id = card.get(LootId)
            if (loot_id !== undefined)
                world.killEntity(loot_id)
            anim_fade_card(card)

            world.killEntity(card)
            break
        }

        case E_CardType.weapon: {
            const in_hand = world.q(InHand)
            let in_hand_id = in_hand.length
            if (in_hand.length === 3) {
                for (let i = 0; i < in_hand.length; i++) {
                    const card_in_hand = in_hand[i]
                    if (i === 0) {
                        world.killEntity(card_in_hand)
                    } else {
                        card_in_hand.remove(InHand)
                        card_in_hand.add(new InHand(i - 1))
                    }
                }
                in_hand_id = 2
            }
            anim_collect_card(card)

            card.remove(OnBoard)
            card.add(new InHand(in_hand_id))

            update_card(document.querySelector('#card-hand'+in_hand_id), true)
            anim_new_weapon(in_hand_id)
            break
        }
    }

}

const move_down_on_board = (pos: Vector) => {
    const id_from = from_v(pos)
    const id_to = from_v(pos.sub(v(0, 1)))

    const card = world.qo(
        new OnBoard(id_from),
    )
    if (card === undefined) return

    card.remove(OnBoard)
    card.add(new OnBoard(id_to))
}

const add_new_on_board = (pos: Vector) => {
    const card = world.qo(InUpcomingPile)

    if (card === undefined) return

    card.remove(InUpcomingPile)
    card.add(new OnBoard(from_v(pos)))
}


const select_item_from_hand = (key: number) => {

    const card = world.qo(new InHand(key))
    if (card === undefined) return

    card.add(new IsChosen())

    ensure_faded()
}

const ensure_faded =() => {
    const card = world.qo(InHand, IsChosen)
    if (card === undefined) {
        deselect()
        return
    }

    const name = card.get(CardVariant)
    const {
        filters,
        pattern
    } = weapons_map.get(name)

    const candidates = select(filters, pattern).map(ent => ent.id)

    world.q(OnBoard).forEach(ent => {
        if (!in_array(candidates, ent.id))
            ent.add(IsFaded)
    })
}

const deselect = () => {
    world.q(IsChosen).forEach(ent => {
        ent.remove(IsChosen)
    })

    world.q(IsFaded).forEach(ent => {
        ent.remove(IsFaded)
    })

    // ensure_active_item()

}


const ensure_active_item = () => {
    const current = world.qo(InHand, IsChosen)
    if (current !== undefined) return

    const card = world.qo(InHand)
    if (card === undefined) return

    deselect()
    select_item_from_hand(card.get(InHand))
}

const start_turn = () => {
    const player = get_godlike.player_data()
    player.swipe_points = player.swipe_points_max

    restore_triggers()
    world.q(OnTurnStart, OnBoard).forEach(ent => {
        const {on_turn_start} = mobs_map.get(ent.get(CardVariant))
        on_turn_start(ent)
    })
}
const end_turn = () => {
    // APPLY EFFECTS
    const player = get_godlike.player_data()
    const godlike = get_godlike.godlike()

    if (godlike.has(EffectPoisoned)) {
        const value = godlike.get(EffectPoisoned)
        player.hp -= 1
        if (value === 1) {
            godlike.remove(EffectPoisoned)
        } else {
            godlike.modify(EffectPoisoned).sub(1)
        }
    }

    // TRIGGER
    world.q(OnTurnEnd, OnBoard).forEach(ent => {
        const {on_turn_end} = mobs_map.get(ent.get(CardVariant))
        on_turn_end(ent)
    })
}

const clear_effects = () => {
    const godlike = get_godlike.godlike()

    if (godlike.has(EffectPoisoned)) {
        godlike.remove(EffectPoisoned)
    }
}

const restore_triggers = () => {
    world.q(OnSwapDisabled).forEach(ent => {
        ent.remove(OnSwapDisabled)
    })
}

export default {
    init_board,
    consume_card,
    move_down_on_board,
    add_new_on_board,
    select_item_from_hand,
    deselect,
    ensure_active_item,
    ensure_faded,
    start_turn,
    end_turn
}