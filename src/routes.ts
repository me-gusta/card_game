import {run_level} from "./routes/level"
import {init_route} from "./routing"
import {get_run_data, get_segment, init_run, print_segments} from "./routes/run_manager"
import {world} from "./game/create_world"
import {DevData, GodLike, LevelData, LevelResults, RunData} from "./game/components"
import {extract, set_single, world_global} from "./global/create_world"
import {new_element, q, sleep} from "./animations/helpers"
import {deck} from "./routes/deck"
import anime from "animejs/lib/anime.es"
import {lib_mobs, lib_weapons, mobs_by_theme} from "./global/libs"


const level = {
    content: `
        <div class="wrap level bg">
            <div class="header">
                <div class="group">
                    <div class="btn-header">
                        <div class="icon icon-help"></div>
                    </div>
                </div>
                <div class="group">
                    <div class="group-coins">
                        <div class="coins">
                            15
                        </div>
                        <div class="icon icon-coins"></div>
                    </div>
                    <div class="btn-header settings">
                        <div class="icon icon-settings"></div>
                    </div>
                </div>
            </div>
            <div class="board"></div>


            <div class="statistics">
                <div class="group">
                    <div class="bg-portrait">
                        <div class="statistics-portrait"></div>
                    </div>
                    
                    <div class="statistics-group">
                        <div class="statistics-row statistics-hp">
                            <div class="icon"></div>
                            <div class="statistics-text">
                                <span class="hp">20</span>/<span class="hp-max">20</span>
                            </div>
                        </div>
                        <div class="statistics-row statistics-power">
                            <div class="icon"></div>
                            <div class="statistics-hp-text">
                                <span class="power">1</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                
                <div class="next-turn">
                    <div class="next-turn-icon"></div>
                </div>
            </div>
            <div class="hand"></div>


        </div>`,
    init: async () => {

        const ld = extract(LevelData)
        q('.bg').classList.add(`bg-${ld.theme}`)

        q('.settings').addEventListener('click', () => {
            init_route(menu)
        })

        run_level().then()
    }
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
        
        <div class="play-area"></div>

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
        
        <div class="dev-btns">
            <button class="dev-btn">меню разработчика</button>        
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

        const play_area = q('.play-area')

        play_area.addEventListener('click', async () => {
            await init_route(run_manager)
        })
        q('.deck').addEventListener('click', async () => {
            await init_route(deck)
        })
        q('.dev-btn').addEventListener('click', async () => {
            await init_route(dev)
        })

        let touchstartX = 0
        let touchstartY = 0
        let touchendX = 0
        let touchendY = 0


        play_area.addEventListener('touchstart', async (event) => {
            touchstartX = event.changedTouches[0].screenX
            touchstartY = event.changedTouches[0].screenY
        }, false)

        play_area.addEventListener('touchend', async (event) => {
            touchendX = event.changedTouches[0].screenX
            touchendY = event.changedTouches[0].screenY
            if (touchendY < touchstartY) {
                await init_route(run_manager)
            }
        }, false)
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


const dev = {
    content: `
    <div class="wrap dev">
        <div class="row">
            <label for="is-on">Включить режим разработчика</label>
            <input type="checkbox" id="is-on" /> 
        </div>
        <div class="row">
            Локация
            <select class="theme" id="theme">
              <option value="dungeon">Сумрачный Лес</option>
              <option value="sea">Река Безысходности</option>
              <option value="hell">Царство Тьмы</option>
            </select>
        </div>
        <div class="row">
            <label for="is-gen">Включить настройку генерации карт</label>
            <input type="checkbox" id="is-gen" /> 
        </div>
        <div class="row">
            Монстры
        </div>
        <div class="row">
            Обычный 1
            <select class="mobs" id="mob-common-1">
            </select>
        </div>
        <div class="row">
            Обычный 2
            <select class="mobs" id="mob-common-2">
            </select>
        </div>
        <div class="row">
            Редкий
            <select class="mobs" id="mob-rare">
            </select>
        </div>
        <div class="row">
            Оружие
        </div>
        <div class="row">
            Обычное
            <select class="weapons" id="weapon-basic">
            </select>
        </div>
        
        <div class="row">
            <button class="save">Сохранить</button> 
            <button class="exit">Выйти</button> 
        </div>
        
    </div>
    `,
    init: async () => {
        const el_is_on = q('#is-on')
        const el_theme = q('#theme')
        const el_is_gen = q('#is-gen')
        const el_common_1 = q('#mob-common-1')
        const el_common_2 = q('#mob-common-2')
        const el_rare = q('#mob-rare')
        const el_weapon = q('#weapon-basic')


        const add_weapons  = () => {
            for (let weapon in lib_weapons)
                el_weapon.appendChild(new_element(
                    `<option value="${weapon}">${weapon}</option>`
                ))
        }

        add_weapons()

        const add_mobs = () => {
            const elem_mobs = document.querySelectorAll('.mobs')
            const theme = el_theme.value
            const list = mobs_by_theme[theme]
            for (let elem of elem_mobs) {
                elem.innerHTML = ''
                for (let name of list)
                    elem.appendChild(new_element(
                        `<option value="${name}">${name}</option>`
                    ))
            }
            const dev_data = extract(DevData)
            el_common_1.value = dev_data.common_1
            el_common_2.value = dev_data.common_2
            el_rare.value = dev_data.rare
        }

        const dev_data = extract(DevData)

        if (dev_data.is_on !== undefined) {
            el_is_on.checked = dev_data.is_on
            el_theme.value = dev_data.theme
            el_is_gen.checked = dev_data.is_gen
            el_common_1.value = dev_data.common_1
            el_common_2.value = dev_data.common_2
            el_rare.value = dev_data.rare
            el_weapon.value = dev_data.weapon
            console.log(dev_data)
        }

        add_mobs()
        el_theme.onchange = add_mobs

        q('.exit').addEventListener('click', () => {
            init_route(menu)
        })
        q('.save').addEventListener('click', () => {
            const is_on = el_is_on.checked
            const theme = el_theme.value
            const is_gen = el_is_gen.checked
            const common_1 = el_common_1.value
            const common_2 = el_common_2.value
            const rare = el_rare.value
            const weapon = el_weapon.value

            const dev_data_new = {
                is_on,
                theme,
                is_gen,
                common_1,
                common_2,
                rare,
                weapon
            }
            set_single(
                new DevData(dev_data_new)
            )

            localStorage.setItem('dev_data', JSON.stringify(dev_data_new))
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
    box_opener,
    dev
}