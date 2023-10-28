//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////


import routes from "./routes";
import {init_route} from "./routing";
import {world_global} from "./global/create_world";

const dev_settings = {
    initial_level: 38,
    chosen_monsters: []
}

window.onload = async () => await init_route(routes.run_manager)