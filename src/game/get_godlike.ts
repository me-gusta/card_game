import {world} from "./create_world";
import {ActionSwitch, GodLike, PlayerData, RoundData, RunData} from "./components";
import {world_global} from "../global/create_world";

const godlike = () => {
    return world.qo(GodLike)
}

const round_data = () => {
    return world.qo(RoundData).get(RoundData)
}

const player_data = () => {
    return world.qo(PlayerData).get(PlayerData)
}

const run_data = () => {
    return world_global.qo(RunData).get(RunData)
}

const action_switch = () => {
    return world.qo(ActionSwitch).get(ActionSwitch)
}



export default {
    round_data,
    player_data,
    godlike,
    run_data,
    action_switch
}