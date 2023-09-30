import {world} from "./create_world";
import {GodLike, PlayerData, RoundData, RunData} from "./components";

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
    return world.qo(RunData).get(RunData)
}



export default {
    round_data,
    player_data,
    godlike,
    run_data
}