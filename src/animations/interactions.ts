import anime from "animejs/lib/anime.es.js";
import {CardVariant, InHand, OnBoard, Value} from "../game/components";
import get_godlike from "../game/get_godlike";
import {q} from "./helpers";

export const anime_shake = (targets) => {
    anime.timeline({
        targets: targets,
    }).add({
        scaleX: 0.8,
        scaleY: 0.9,

        easing: 'easeOutQuint',
        duration: 50,
        keyframes: [
            {rotate: 3},
            {rotate: -3},
            {rotate: 3},
            {rotate: -3},
            // {rotate: 5},
            // {rotate: -5},
            {rotate: 0},
        ],
    }).add(
        {
            scaleX: 1,
            scaleY: 1,
            easing: 'easeInQuint',
            duration: 160
        }
    )
}

export const anim_bounce_card = (card) => {
    anime_shake(card.parentNode)
}



export const anim_use_card = (ent) => {
    const card = q('#card-hand' + ent.get(InHand))
    anime.timeline({
        targets: card,
    }).add({
        // scaleX: 0.9,
        scaleY: 0.8,
        translateY: '-10%',

        easing: 'easeOutQuint',
        duration: 50,
    }).add({
        scaleX: 1,
        scaleY: 1,
        translateY: '0%',
        easing: 'easeInQuint',
        duration: 100
    })
}


export const anim_attack_card = (ent) => {
    const card = '#card-' + ent.get(OnBoard)
    anime.timeline({
        targets: card,
    }).add({
        scaleX: 0.9,
        scaleY: 0.8,
        translateY: '30%',

        easing: 'easeOutQuint',
        duration: 50,
    }).add({
        scaleX: 1,
        scaleY: 1,
        opacity: 0.3,
        translateY: '0%',
        easing: 'easeInQuint',
        duration: 180
    }).add({
        opacity: 0,
        translateY: '0%',
        easing: 'easeInQuint',
        duration: 20
    })
}

export const anim_collect_card = (ent) => {
    const card = q('#card-' + ent.get(OnBoard))
    anime.set(card.parentElement,
        {
            'z-index': 90
        }
    )
    anime.timeline({
        targets: card,
        easing: 'easeInQuint',
        complete: () => {
            anime.set(card.parentElement,
                {
                    'z-index': 1
                }
            )
        }
    }).add({
        scaleX: 1.1,
        scaleY: 1.1,
        opacity: 1,
        // opacity: 0,
        // translateY: '30%',

        duration: 150,
    }).add({
        // scaleX: 0.5,
        // scaleY: 0.5,
        opacity: 0,
        // translateY: '80%',

        duration: 50,
    })
}

export const anim_fade_card = (ent) => {
    const card = '#card-' + ent.get(OnBoard)
    anime({
        targets: card,
        duration: 200,
        easing: 'easeOutQuad',
        opacity: 0,
        scale: 0.6
    })
}

export const anim_set_hp = () => {

    const elem_hp = q('.hp')
    const pd = get_godlike.player_data()
    elem_hp.textContent = pd.hp
}
export const anim_hero_take_damage = () => {
    anim_set_hp()
    anime_shake('.statistics-portrait')
}

export const anim_collect_coins = () => {
    const pd = get_godlike.player_data()
    const elem = q('.coins')
    elem.textContent = pd.coins
}

export const anim_hero_heal = () => {
    anim_set_hp()
}

export const anim_new_weapon = (key) => {
    console.log('new weapon')
    const card = '#card-hand' + key
    anime({
        targets: card,
        duration: 100,
        easing: 'easeOutQuad',
        opacity: 1,
        scale: 1,
    })
}

export const anim_weapon_exit = (key) => {
    const card =  q('#card-hand' + key)
    const parent = card.parentElement
    if (parent.classList.contains('active'))
        parent.classList.remove('active')
    anime({
        targets: card,
        duration: 100,
        easing: 'easeOutQuad',
        translateX: '-200%'
        // opacity: 1,
        // scale: 1,
    })
}
export const anim_weapon_move = (key) => {
    const card =  q('#card-hand' + key)
    const parent = card.parentElement
    if (parent.classList.contains('active'))
        parent.classList.remove('active')
    anime({
        targets: card,
        duration: 100,
        easing: 'easeOutQuad',
        translateX: '-110%'
    })
}


export const anim_deal_damage = (ent) => {
    const key = ent.get(OnBoard)
    const card = q('#card-' + key)
    anim_bounce_card(card)
    card.querySelector('.card-value').textContent = ent.get(Value)
}