import {run_level} from "./routes/level";
import {init_route} from "./routing";
import {get_run_data, get_segment, init_run, print_segments} from "./routes/run_manager";
import {world} from "./game/create_world";
import {GodLike, LevelResults, RunData} from "./game/components";
import {world_global} from "./global/create_world";
import {sleep} from "./animations/helpers";
import {deck} from "./routes/deck";


const level = {
    content: `
        <div class="wrap">
            <div class="board"></div>


            <div class="statistics">
                <div class="statistics-hp">
                    <span class="hp">20</span> /
                    <span class="hp-max">20</span>
                </div>
                <div class="statistics-portrait">

                </div>
                <div class="next-turn">
                    вперед
                </div>
            </div>
            <div class="hand"></div>


        </div>`,
    init: async () => run_level().then()
}

const run_manager = {
    content: ``,
    init: async () => {
        let run_data = get_run_data()

        if (run_data === undefined) {
            world_global.qo(GodLike).add(
                new RunData({
                    current_level: 38,
                    hp: 20,
                    hp_max: 20
                })
            )
            run_data = get_run_data()
        } else {
            await init_route(map_preview)
        }

        await init_run()
        await init_route(level)
    }
}

const run_ender = {
    content: ``,
    init: async () => {
        const g = world_global.qo(GodLike)
        const results = g.get(LevelResults)
        g.remove(LevelResults)
        console.log('round_ended')
        console.log(results)
        const run_data = world_global.qo(GodLike).get(RunData)
        run_data.current_level += 1
        run_data.coins += results.coins
        run_data.hp = results.hp

        await init_route(run_manager)
    }
}
const map_preview = {
    content: `<div class="wrap centered">
    <div class="lvl" style="font-size: 120px;"></div>
</div>`,
    init: async () => {
        const run_data = world_global.qo(GodLike).get(RunData)
        document.querySelector('.lvl').textContent = String(run_data.current_level - 1)
        await sleep(1000)

        document.querySelector('.lvl').textContent = String(run_data.current_level)
        await sleep(1000)
        // await init_route(run_manager)
    }
}




const menu = {
    content: `
    <div class="wrap centered">
        <div class="btn play">Play</div> 
        <div class="btn deck">Deck</div>
    </div>
    `,
    init: async () => {
        document.querySelector('.play').addEventListener('click', async () => {
            await init_route(run_manager)
        })
        document.querySelector('.deck').addEventListener('click', async () => {
            await init_route(deck)
        })
    }
}

export default {
    level,
    menu,
    run_manager,
    run_ender,
    map_preview,
    deck
}