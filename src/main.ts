//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////


import routes from "./routes";
import {init_route} from "./routing";
import {world_global} from "./global/create_world";


window.onload = async () => await init_route(routes.box_opener)