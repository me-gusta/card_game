import {create_card, run_level} from "./routes/level"
import {init_route} from "./routing"
import {get_segment, init_run, print_segments} from "./routes/run_manager"
import {recreate_world, world} from "./game/create_world"
import {
    CardType,
    CardVariant,
    DevData,
    GodLike,
    LevelData,
    LevelResults,
    OnBoard,
    RunData,
    Value
} from "./game/components"
import {extract, purge, set_single, world_global} from "./global/create_world"
import {new_element, q, sleep} from "./animations/helpers"
import {deck} from "./routes/deck"
import anime from "animejs/lib/anime.es"
import {lib_mobs, lib_weapons, mobs_by_theme} from "./global/libs"
import Typed from 'typed.js';
import {getRandomChoice} from "./game/helpers";
import {anime_shake} from "./animations/interactions";
import {World} from "./ecw/world";
import {update_card} from "./animations/flip";

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
                            0
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
            
            <div class="wrap help">
                <div class="help-content bg bg-clouds">
                    <div class="help-title text-shadow">HOUND</div>
                    <div class="help-image"></div>
                    <div class="help-description text-shadow">
                        This thing is absolute danger. play with fire
                    </div>
                    <div class="button-close">
                        <div class="icon icon-cross"></div>
                    </div>
                </div>
            </div>


        </div>`,
    init: async () => {

        const ld = extract(LevelData)
        q('.bg').classList.add(`bg-${ld.theme}`)

        q('.settings').addEventListener('click', () => {
            init_route(menu)
        })

        q('.button-close').addEventListener('click', () => {
            anime({
                targets: '.help',
                easing: 'easeOutSine',
                duration: 250,
                opacity: 0,
                complete: () => {
                    anime.set('.help', {
                        display: 'none'
                    })
                }
            })
        })

        run_level().then()
    }
}

const run_manager = {
    content: ``,
    init: async () => {
        let run_data = extract(RunData)
        let theme = 'dungeon'
        const dd = extract(DevData)
        console.log(dd)
        if (dd)
            theme = dd.theme

        if (run_data === undefined) {
            world_global.qo(GodLike).add(
                new RunData({
                    current_level: 1,
                    hp: 33,
                    hp_max: 33,
                    coins: 0,
                    theme
                })
            )
            run_data = extract(RunData)
        }
        await init_route(map_preview)

        await init_run()
        await init_route(level)
    }
}

const dev_level = {
    content: `
<div class="wrap dev-level bg bg-dungeon">
    <div class="scrollable">
        <div class="board"></div>
    </div>
    <div class="buttons bg bg-dungeon">
        <div class="btn prev">prev</div>
        <div class="lvl-counter"></div>
        <div class="btn next">next</div>
        <div class="btn exit">x</div>
    </div>
</div>`,
    init: async () => {
        if (extract(RunData) === undefined) {
            world_global.qo(GodLike).add(
                new RunData({
                    current_level: 1,
                    hp: 33,
                    hp_max: 33,
                    coins: 0,
                    theme: 'dungeon'
                })
            )
        }
        await init_run()

        recreate_world()
        const board = document.querySelector('.board')
        const rd = extract(RunData)
        const ld = extract(LevelData)
        const cards = [...ld.cards.cards]
        cards.reverse()

        console.log(rd)
        console.log(ld)
        q('.lvl-counter').textContent = rd.current_level
        let i = 0
        for (let card of cards) {
            world.createEntity(
                new OnBoard(i),
                new CardType(card.type),
                new CardVariant(card.variant),
                new Value(card.value)
            )
            const elem = create_card({
                i: i++,
            })
            board.appendChild(
                elem
            )
            update_card(elem.firstElementChild)
        }
        q('.scrollable').scrollTop = q('.scrollable').scrollHeight;

        q('.prev').onclick = async () => {
            if (rd.current_level !==1) {
                rd.current_level -= 1
                await remake()
            }
        }

        q('.next').onclick = async () => {
            rd.current_level += 1
            await remake()
        }
        q('.exit').onclick = async () => {
            purge(RunData)
            await init_route(menu)
        }

        const remake = async () => {

            await init_run()
            await init_route(dev_level)
        }

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

let letters = [
    'ау, здесь кто-нибудь есть?',
    'мерцанье доносится из полутьмы',
    'я делаю первый шаг.',
    'может это все зря?',
    'вокруг мутные волные неуютности',
    'меня одолевает голод',
    'мне нравится этот странный запах',
    'я чуть было не упал в ту яму',
    'я не видел ее из далека',
    'стон? звон? шепот?',
    'кто говорит со мной по ночам',
    'вы ничего не понимате.',
    'я должен был поступить иначе',
    'как это могло произойти со мной',
    'я хочу вернуться домой',
    'мне надоело это вязкое болото',
    'я люблю убивать монстров',
    'их не становиться меньше',
    'этот туман никогда не рассеется',
    'что здесь за странное место?',
    'Похоже, эта тропа очень древняя',
    'я уже где-то слышал про эти места',
    'я не могу терпеть, мне тяжело',
    'что вам от меня нужно?',
    'я устал, я по колено в воде',
    'мне нужен сон',
    'зачем они меня будят?',
    'стены покрыты густой слизью',
    'мне уже нравится открывать двери',
    'хорошо, что здесь есть оружие',
    'с каждым мигом тяжелее дышать',
    'чьё имя высечено на этих камнях?',
    'они снова на меня смотрят.',
    'зачем мне открылся этот путь',
    'как я мог быть легкомысленным',
    'я слишком далеко, чтобы сдаться',
    'бескрайний, безобразный лабиринт',
    'я помню как спокойно было в лесу',
    'мне нужно что-то делать',
    'хватит! перестаньте кричать!',
    'кто меня оставил здесь?',
    'я просто хочу остаться в покое.',
    'повсюду надписи, я не знаю',
    'этот язык, но мой меч',
    'блестит когда я открываю дверь.',
    'что они все от меня хотят?',
    'почему их так много вокруг?',
    'они хотят завершить мою жизнь.',
    'мне не комфортно,',
    'душно, влажно, нужен привал.',
    'но как можно здесь оставаться',
    'мне так свежо, это странно',
    'моя голова покрылась пеплом',
    'кто зажигает звезды?',
    'они хотят чтобы я испытывал боль',
    'я открыл новую дверь',
    'мне нужно быть на стороже',
    'временами мне вспоминается лес',
    'меня атакует жажда тишины',
    'я должен узнать что будет после',
    'они знают каждый мой шаг',
    'чем дальше, тем больше огня',
    'кто это все придумал?',
    'дикие звери, просторные коридоры',
    'это все похоже на зоопарк',
    'я все никак не могу успокоиться',
    'скрежущий вопль...',
    'я уже почти привык к тебе',
    'я должен продолжать путь.',
    'я так долго был в поиске причин.',
    'Я вижу лучи солнца',
    'может я здесь не случайно.',
    'собрать хладнокровие в кулак',
    'я смогу это сделать',
    'я привык наблюдать огонь',
    'получите! вы это заслуживаете!',
    'подходи! по одному!',
    'я готов! я готов! я готов!',
    'раз-два-три...',
    'камень...',
    'славный ливень безупречного',
]

letters.sort((a, b) => b.length - a.length)
// console.log(letters)
// letters = letters.slice(0, 6)

const set_type_anim = () => {
    const strings = [getRandomChoice(letters), getRandomChoice(letters), getRandomChoice(letters)]
    const type_speed = 50
    let delay = 0
    for (let i = 0; i < 3; i++) {
        const str = strings[i]
        setTimeout(() => {
            new Typed(`.letter-${i}`, {
                strings: [str],
                typeSpeed: type_speed,
                showCursor: false
            })
        }, delay)
        delay += str.length * type_speed * 2
    }
}

const map_preview = {
    content:
        `<div class="wrap map bg">
            <div class="header text-shadow">
                <div class="sep sep-top"></div>
                <div class="title"></div>
                <div class="lvl"></div>
                <div class="sep sep-bot"></div>
            </div>
            
            <div class="choice">
                <span class="choice-heading text-shadow">
                    ● Настало время ● <br>
                    Здесь выбор за тобой
                </span>
                <div class="choice-btns">
                    <div class="choice-btn max-hp">
                        <span>+ Запас<br>здоровья</span>
                        <div class="icon icon-hp"></div>
                    </div>
                    <div class="choice-btn weapons">
                        <span>+ Сила<br>оружия</span>
                        <div class="icon icon-weapon"></div>
                    </div>
                    <div class="choice-btn heal">
                        <span>Полное исцеление</span>
                        <div class="icon icon-heal"></div>
                    </div>
                </div>
            </div>
            
            <div class="rotator">
                <div class="rotator-inside">
                    <div class="vertical top">
                        <div class="marker marker-move marker-skull"></div>
                        <div class="marker marker-move marker-skull"></div>
                        <div class="marker marker-move marker-skull"></div>
                        <div class="marker marker-move marker-skull"></div>
                        <div class="marker marker-expand marker-skull"></div>
                    </div>
                    <div class="center">
                        <div class="marker marker-skull"></div>
                    </div>
                    <div class="vertical bottom">
                        <div class="marker marker-move marker-skull-killed"></div>
                        <div class="marker marker-move marker-skull-killed"></div>
                        <div class="marker marker-move marker-skull-killed"></div>
                        <div class="marker marker-move marker-skull-killed"></div>
                        <div class="marker marker-move marker-skull-killed"></div>
                    </div>
                </div>
            </div>
            
            <div class="footer bg">
                <div class="container">
                    <div class="text-wrap">
                        <div class="letter text-shadow">
                            <span class="letter-0">...</span>
                            <span class="letter-1">...</span>
                            <span class="letter-2">...</span>
                        </div>
                    </div>
                    <div class="icon-wrap">
                        <div class="bg-map-portrait">
                            <div class="portrait"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    init: async () => {
        const skip = true
        if (skip)
            return
        console.log('RUN MAP PREVIEW')
        const rd = world_global.qo(GodLike).get(RunData)
        console.log(rd)
        const lvl = rd.current_level

        const theme = rd.theme

        q('.bg').classList.add(`bg-${theme}`)
        q('.header').classList.add(`header-${theme}`)
        q('.sep-top').classList.add(`sep-${theme}`)
        q('.sep-bot').classList.add(`sep-${theme}`)

        q('.choice').classList.add(`color-${theme}`)
        q('.header').classList.add(`color-${theme}`)
        q('.footer').classList.add(`color-${theme}`)
        q('.footer').classList.add(`header-${theme}`)

        q('.bg-map-portrait').classList.add(`${theme}`)

        document.querySelectorAll('.choice-btn').forEach(el => {
            el.classList.add(`${theme}`)
        })

        if (theme === 'dungeon')
            q('.title').textContent = 'Сумрачный Лес'
        else if (theme === 'sea')
            q('.title').textContent = 'Мертвое Море'
        else if (theme === 'hell')
            q('.title').textContent = 'Царство Тьмы'

        q('.choice').classList.add('display-none')
        // set_type_anim()

        anime.set('.top .marker', {
            'background-size': '48px'
        })
        anime.set('.bottom .marker', {
            'background-size': '42px'
        })

        setTimeout(() => {
            const center = q('.center .marker')
            center.classList.remove('marker-skull')
            center.classList.add('marker-skull-killed')
            anime_shake(center)
        }, 300)

        setTimeout(() => {
            anime({
                targets: '.marker-move',
                easing: 'easeInOutQuint',
                duration: 900,
                translateY: 64 + 10
            })
            anime({
                targets: '.marker-expand',
                easing: 'easeInOutQuint',
                duration: 900,
                translateY: 64 + 10,
                'background-size': '64px',
            })

            anime({
                targets: '.center .marker',
                easing: 'easeInOutQuint',
                duration: 900,
                translateY: 64 + 10,
                'background-size': '42px',
                opacity: 0.6,
            })

        }, 600)

        anime({
            targets: '.sep-top',
            easing: 'linear',
            duration: 900 + 600,
            translateX: -75
        })
        anime({
            targets: '.sep-bot',
            easing: 'linear',
            duration: 900 + 600,
            translateX: 75
        })

        document.querySelector('.lvl').textContent = String(lvl - 1)
        await sleep(1000)

        document.querySelector('.lvl').textContent = String(lvl)
        await sleep(1000)


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
            <button class="dev-btn-level">проверить генератор</button>        
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
        q('.dev-btn-level').addEventListener('click', async () => {
            await init_route(dev_level)
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
            'background-position': '100% 0%',
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
                'background-image': 'url("assets/images/map_preview/chest_open.gif")',
                skew: '0deg, 0deg',
                translateX: 0
            })
            anime({
                targets: '.salut-hide',
                opacity: 0.8
            })

            q('.box-opener').appendChild(new_element('<div class="explosion"></div>', {
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


        const add_weapons = () => {
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
            if (dev_data) {
                el_common_1.value = dev_data.common_1
                el_common_2.value = dev_data.common_2
                el_rare.value = dev_data.rare
            }
        }

        const dev_data = extract(DevData)

        if (dev_data && dev_data.is_on !== undefined) {
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

            if (!is_on) {
                purge(DevData)
                localStorage.removeItem('dev_data')
                init_route(menu)
                return
            }

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
            init_route(menu)
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
    dev,
    dev_level
}