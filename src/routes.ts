import {run_level} from "./routes/level";
import {init_route} from "./routing";
import {get_run_data, get_segment, init_run, print_segments} from "./routes/run_manager";
import {world} from "./game/create_world";
import {GodLike, LevelResults, RunData} from "./game/components";
import {world_global} from "./global/create_world";
import {new_element, q, sleep} from "./animations/helpers";
import {deck} from "./routes/deck";
import anime from "animejs/lib/anime.es";


const level = {
    content: `
        <div class="wrap bg bg-dungeon">
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
                    current_level: 1,
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
    content: `<div class="wrap map bg">
    <div class="header">
        <div class="sep sep-top"></div>
        <div class="title"></div>
        <div class="lvl"></div>
        <div class="sep sep-bot"></div>
    </div>
    
    
        </div>`,
    init: async () => {
        // const run_data = world_global.qo(GodLike).get(RunData)
        const lvl = 3// run_data.current_level

        // set stylings
        // let styling = 'hell'
        // let styling = 'sea'
        let styling = 'dungeon'

        q('.bg').classList.add(`bg-${styling}`)
        q('.header').classList.add(`header-${styling}`)
        q('.sep-top').classList.add(`sep-${styling}`)
        q('.sep-bot').classList.add(`sep-${styling}`)

        q('.title').textContent = 'Сумрачный Лес'
        // q('.title').textContent = 'Мертвое Море'
        // q('.title').textContent = 'Царство Тьмы'


        anime({
            targets: '.sep-top',
            easing: 'linear',
            duration: 2000,
            translateX: -50
        })
        anime({
            targets: '.sep-bot',
            easing: 'linear',
            duration: 2000,
            translateX: 50
        })

        document.querySelector('.lvl').textContent = String(lvl - 1)
        await sleep(1000)

        document.querySelector('.lvl').textContent = String(lvl)
        await sleep(1000)
        // await init_route(run_manager)


    }
}




const menu = {
    content: `
    <div class="wrap centered menu">
        <div class="backgrounds">
            <div class="wrap bg bg-color-1"></div>
            <div class="wrap bg bg-color-2"></div>
            <div class="wrap bg bg-menu"></div>
            <div class="eyes"></div>
            <div class="arrow-up"></div>
        </div>
        
        <div class="play"></div>

        <div class="btns">
            <div class="btn-flat deck">
                <div class="icon spellbook"></div>
                Spells
            </div>
            <div class="btn-flat deck">
                <div class="icon wardrobe"></div>
                Wardrobe
            </div>
        </div>
    </div>
    `,
    init: async () => {
        anime({
            targets: '.arrow-up',
            duration: 500,
            easing: 'easeOutQuint',
            translateY: -20,
            loop: true,
            direction: 'alternate',
        })
        anime({
            targets: '.icon',
            duration: 400,
            easing: 'linear',
            translateY: 5,
            loop: true,
            direction: 'alternate',
        })

        document.querySelector('.play').addEventListener('click', async () => {
            await init_route(run_manager)
        })
        document.querySelector('.deck').addEventListener('click', async () => {
            await init_route(deck)
        })
    }
}


const box_opener = {
    content: `
    <div class="wrap centered box-opener bg bg-box-opener">
        <div><img src="assets/images/map_preview/chest_open.png"/>  </div>
        <div class="wrap bg bg-rainbow"></div>
        <div class="spiral spiral-1"></div>
        <div class="spiral spiral-2"></div>
        <div class="wrap ground bg bg-dungeon"></div>
        <div class="salut salut-1"></div>
        <div class="salut salut-2 salut-hide"></div>
        <div class="salut salut-3 salut-hide"></div>
        <div class="salut salut-4 salut-hide"></div>
        <div class="salut salut-5 salut-hide"></div>
            
            <div class="box">
                <div class="sprite box-front"></div>
            </div>
            
        
    </div>
    `,
    init: async () => {

        anime.set('.bg-dungeon', {
            perspective: 80,
            rotateX: 20,
        })

        anime.set('.bg-wall-1', {
            rotateY: 20,
            translateX: '-50%'
        })


        anime({
            target: '.box-opener',
            easing: 'linear',
            duration: 1200,
            'background-position':'100% 0%',
            loop: true
        })

        const move = 7
        const diff = 10
        anime.set('.box-front', {
            skew: '5deg, 0deg',
            translateX: -move
        })

        const tl = anime.timeline({
            targets: '.box-front',
            easing: 'linear',
            duration: 1200,
            direction: 'alternate',
            loop: true
        }).add({
            skew: '-5deg, 0deg',
            translateX: move
        })

        const rainbow = anime({
            targets: '.bg-rainbow',
            easing: 'linear',
            duration: 300000,
            'background-position': '10000%',
        })


        q('.box').addEventListener('click', async () => {
            tl.pause()
            rainbow.pause()
            anime({
                targets: '.spiral-1',
                easing: 'linear',
                duration: 1000,
                opacity: 0.0,
            })
            anime.set('.box-front', {
                'background-image': 'url("assets/images/map_preview/chest_open.png")',
                skew: '0deg, 0deg',
                translateX: 0
            })
            anime({
                targets: '.salut-hide',
                opacity: 0.8
            })

            q('.box-opener').appendChild(new_element('<div class="explosion"></div>',{
                'background-image': `url("assets/images/box_opener/explosion.gif")`,
            }))

            console.log(anime.get('.bg-rainbow', 'background-position'))

            // anime.set('.bg-rainbow', {
            //     animation: 'none',
            // })
        })

    }
}


export default {
    level,
    menu,
    run_manager,
    run_ender,
    map_preview,
    deck,
    box_opener
}