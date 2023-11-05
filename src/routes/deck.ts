import {create_card, find_image} from "./level";
import {img_url, q} from "../animations/helpers";
import {flip_card} from "../animations/flip";
import anime from "animejs/lib/anime.es";
import {world} from "../game/create_world";
import {CardVariant, SpellLib, SpellsUserData} from "../game/components";
import {extract, world_global} from "../global/create_world";
import {weapons_map} from "../game/behaviours/weapons";
import {i18n} from "../localization";
import {init_route} from "../routing";
import routes from "../routes";

const set_spell = (card, variant) => {
    const description = i18n.t(variant)
    const url_icon = img_url(`weapon/${variant}`, true)
    if (card.id.includes('slider')) {
        q('.description').textContent = description
        q('.title').textContent = i18n.t('title_' + variant)
    }

    anime.set(card.querySelector('.card-icon'), {
        'background-image': `${url_icon}`,
    })
}

const anim_choosing = (is_choosing) => {
    if (is_choosing) {
        q('#card-0').parentElement.classList.add('active')
        q('#card-1').parentElement.classList.add('active')
        anime({
            targets: [q('#card-0'), q('#card-1')],
            duration: 100,
            easing: 'easeOutQuint',
            scale: 0.9
        })
    } else {

        q('#card-0').parentElement.classList.remove('active')
        q('#card-1').parentElement.classList.remove('active')
        anime({
            targets: [q('#card-0'), q('#card-1')],
            duration: 100,
            easing: 'easeOutQuint',
            scale: 1
        })
    }
}

const enable_card = (key, spell) => {
    const spells_ud = extract(SpellsUserData)
    spells_ud[key] = spell.get(CardVariant)
    localStorage.setItem('spells_user_data', JSON.stringify(spells_ud))

    set_spell(q('#card-' + key), spell.get(CardVariant))
}

export const deck = {
    content: `
    <div class="wrap centered">
        <div class="slider"></div>
        <div class="title"></div>
        <div class="description"></div>
        <div class="slider-control">
            <div class="btn prev">prev</div>
            <div class="btn next">next</div>
        </div>
        <div class="row centered">
            <div class="btn use">use</div>
        </div>
        <div class="row centered in-use">
        </div>
        <div class="row centered">
            <div class="btn exit">exit</div>
        </div>
<!--        <div class="btn play">Play</div> -->
<!--        <div class="btn deck">Deck</div>-->
    </div>
    `,
    init: async () => {
        let action_available = true
        const set_available = () => {
            action_available = true
        }

        const unset_available = () => {
            action_available = false
        }

        let is_choosing = false

        const set_choosing = () => {
            anim_choosing(true)
            is_choosing = true
        }

        const unset_choosing = () => {
            anim_choosing(false)
            is_choosing = false
        }

        const spells = world_global.q(SpellLib)
        let current_spell = 0
        const slider = q('.slider')
        slider.appendChild(create_card({i: 'slider', no_events: true}))
        const card = q('#card-slider')
        const size_icon = 100
        anime.set(q('.card-icon'), {
            'background-size': size_icon,
            'width': size_icon,
            'height': size_icon,
        })

        set_spell(card, spells[current_spell].get(CardVariant))

        const spells_ud = extract(SpellsUserData)

        for (let i = 0; i < 2; i++) {
            q('.in-use').appendChild(create_card({i: i, no_events: true}))
            console.log(spells_ud[i])
            if (spells_ud[i])
                set_spell(q('#card-' + i), spells_ud[i])
        }

        q('.next').onclick = () => {
            if (!action_available)
                return
            unset_available()
            unset_choosing()
            if (current_spell === spells.length - 1)
                current_spell = 0
            else
                current_spell++
            flip_card(card, {
                in_hand: false,
                custom_update: () => set_spell(card, spells[current_spell].get(CardVariant)),
                direction: 'right'
            })
            setTimeout(() => {
                set_available()
            }, 350)
        }
        q('.prev').onclick = () => {
            if (!action_available)
                return
            unset_available()
            unset_choosing()
            if (current_spell === 0)
                current_spell = spells.length - 1
            else
                current_spell--
            flip_card(card, {
                in_hand: false,
                custom_update: () => set_spell(card, spells[current_spell].get(CardVariant)),
                direction: 'left'
            })
            setTimeout(() => {
                set_available()
            }, 350)
        }

        q('.use').onclick = () => {
            set_choosing()

            console.log('aa')
        }

        q('#card-0').onclick = () => {
            if (!is_choosing)
                return
            enable_card(0, spells[current_spell])
            unset_choosing()
        }
        q('#card-1').onclick = () => {
            if (!is_choosing)
                return
            enable_card(1, spells[current_spell])
            unset_choosing()
        }

        q('.exit').onclick = () => {
            init_route(routes.menu)
        }

    }
}