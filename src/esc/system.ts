import type { World } from "./world"

export abstract class System {
    priority: number
    world: World

    process(args: any) {

    }
    
    setup() {

    }

}