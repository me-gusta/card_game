import {world} from "./create_world";
import {
    CardType,
    CardVariant,
    Crate, DevData,
    E_CardType,
    Enemy,
    GodLike,
    InHand,
    InLootPile,
    InUpcomingPile,
    LootId,
    OnBoard,
    PlayerData,
    RoundData,
    SetupData,
    Value
} from "./components";
import {getRandomInt, range, shuffleArray} from "./helpers";
import {from_v, v} from "./local_math";
import {weapons_map} from "./behaviours/weapons";
import {mobs_map} from "./behaviours/mobs";
import {food_map} from "./behaviours/food";
import get_godlike from "./get_godlike";
import {extract} from "../global/create_world";


const mob = (variant, key, position_component=OnBoard) => {
    const {
        value_range
    } = mobs_map.get(variant)

    const value = 1//Math.round(getRandomInt(...value_range)  * multiplier)

    const loot = world.createEntity(
        new InLootPile(),
        new Value(getRandomInt(3, 7)),
        new CardType(E_CardType.coin),
    )

    const position = new position_component(key)

    return world.createEntity(
        position,
        new Value(value),
        new CardType(E_CardType.mob),
        new CardVariant(variant),
        new LootId(loot.id),
        new Enemy(),
    )
}

const coin = () => {
    return world.createEntity(
        new Value(getRandomInt(10, 15)),
        new CardType(E_CardType.coin),
    )
}


const upcoming = (data) => {
    console.log(data)
    const cards = shuffleArray(data.cards)
    for (let y of range(cards.length / 3))
        for (let x of range(3)) {

            // let {type, variant} = rng.card(is_good)

            const multipliers = get_godlike.run_data().multiplier
            const multiplier = 1 //is_good ? multipliers.good : multipliers.bad


            const card_n = from_v(v(x, y))

            const {type, variant, value} = cards[card_n]

            switch (type) {
                case E_CardType.weapon: {
                    const {
                        value_range
                    } = weapons_map.get(variant)
                    // const value = Math.round(getRandomInt(...value_range)  * multiplier)

                    const in_crate = getRandomInt(1, 100) < 10

                    const location = in_crate ? new InLootPile() : new InUpcomingPile(card_n)

                    const weapon = world.createEntity(
                        location,
                        new Value(value),
                        new CardType(E_CardType.weapon),
                        new CardVariant(variant),
                    )

                    if (in_crate) {
                        world.createEntity(
                            new InUpcomingPile(card_n),
                            new Value(getRandomInt(1, 2)),
                            new CardType(E_CardType.crate),
                            new LootId(weapon.id),
                            new Crate()
                        )
                    }

                    break
                }
                case E_CardType.mob: {
                    const {
                        value_range,
                        triggers
                    } = mobs_map.get(variant)

                    // const value = getRandomInt(...value_range)

                    const enemy = mob(
                        variant,
                        card_n,
                        InUpcomingPile)
                    enemy.modify(Value).set(value)
                    // const loot = world.createEntity(
                    //     new InLootPile(),
                    //     new Value(getRandomInt(3, 7)),
                    //     new CardType(E_CardType.coin),
                    // )
                    //
                    // const enemy = world.createEntity(
                    //     new InUpcomingPile(card_n),
                    //     new Value(value),
                    //     new CardType(type),
                    //     new CardVariant(variant),
                    //     new LootId(loot.id),
                    //     new Enemy(),
                    // )
                    if (triggers) {
                        for (let cls of triggers)
                            enemy.add(new cls())
                    }
                    break
                }
                case E_CardType.food: {
                    const {
                        value_range,
                    } = food_map.get(variant)

                    // const value = Math.round(getRandomInt(...value_range)  * multiplier)

                    world.createEntity(
                        new InUpcomingPile(card_n),
                        new Value(value),
                        new CardType(type),
                        new CardVariant(variant),
                    )
                    break
                }
                case E_CardType.coin: {
                    world.createEntity(
                        new InUpcomingPile(card_n),
                        new Value(getRandomInt(10, 15)),
                        new CardType(type),
                    )
                }
            }
        }
}

const hand = () => {
    const dd = extract(DevData)
    let weapon = 'sword'
    if (dd) {
        weapon = dd.weapon
    }
    world.createEntity(
        new InHand(0),
        new Value(5),
        new CardType(E_CardType.weapon),
        new CardVariant('sword'),
    )
}

const godlike = (run_data) => {

    world.createEntity(
        new GodLike(),
        new SetupData({
            turns: 25
        }),
        new RoundData({
            turn: 0
        }),
        new PlayerData({
            hp_max: run_data.player.hp_max,
            hp: run_data.player.hp,
            coins: 0,
            swipe_points: 0,
            swipe_points_max: 3
        })
    )
}

export default {
    upcoming,
    godlike,
    hand,
    mob,
    coin
}