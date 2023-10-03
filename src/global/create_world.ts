import {World} from "../esc/world";
import {GodLike} from "../game/components";
import {GeneratorData, LevelData} from "./components";

export const world_global = new World()

world_global.createEntity(new GodLike())

export const purge = (component)=> {
    const prev = world_global.qo(component)
    if (prev)
        prev.remove(component)
}

export const extract = (component) => {
    return world_global.qo(component).get(component)
}