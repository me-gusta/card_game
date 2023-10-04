import {World} from "../esc/world";
import {CardType, CardVariant, E_CardType, GodLike, SpellLib} from "../game/components";

const create_world_global = () => {
    const world = new World()
    world.createEntity(new GodLike())

    const spells = [
        'doubler',
        'make_moose',
        'luxury_dinner',
        'liquidate',
        'recruit',
        'disinfect',
        'harvest',
        'calm_down',
        'grenade',
        'imperfection',
        'blood_donation',
        'grocery',
        'master_key',
        'elementary',
    ]

    for (let spell of spells) {
        world.createEntity(
            new CardType(E_CardType.weapon),
            new CardVariant(spell),
            new SpellLib()
        )
    }

    return world
}

export const world_global = create_world_global()


export const purge = (component) => {
    const prev = world_global.qo(component)
    if (prev)
        prev.remove(component)
}

export const extract = (component) => {
    return world_global.qo(component).get(component)
}