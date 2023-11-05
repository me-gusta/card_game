import {World} from "../ecw/world";
import {CardType, CardVariant, DevData, E_CardType, GodLike, SpellLib, SpellsUserData} from "../game/components";
import {lib_spells} from "./libs";

const create_world_global = () => {
    const world = new World()
    const god_like = world.createEntity(new GodLike())

    const dev_data = JSON.parse(localStorage.getItem('dev_data'))
    if (dev_data)
        god_like.add(new DevData(dev_data))

    const spells_user_data = JSON.parse(localStorage.getItem('spells_user_data'))
    if (spells_user_data)
        god_like.add(new SpellsUserData(spells_user_data))
    else
        god_like.add(
            new SpellsUserData([null, null])
        )


    for (let spell of Object.keys(lib_spells)) {
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
    try {
        return world_global.qo(component).get(component)
    } catch (e) {
        return undefined
    }
}


export const set_single = (component) => {
    purge(typeof component)
    return world_global.qo(GodLike).add(component)
}