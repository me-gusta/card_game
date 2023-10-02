import anime from "animejs/lib/anime.es.js";
import {InHand, OnBoard} from "../game/components";
import get_godlike from "../game/get_godlike";


export const anim_bounce_card = (card) => {
    anime.timeline({
        targets: card.parentNode,
    }).add({
        scaleX: 0.8,
        scaleY: 0.9,

        easing: 'easeOutQuint',
        duration: 10,
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
            duration: 200
        }
    )
}



export const anim_use_card = (ent) => {
    const card = document.querySelector('#card-hand' + ent.get(InHand))
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
    const card = '#card-' + ent.get(OnBoard)
    anime.timeline({
        targets: card,
    }).add({
        scaleX: 0.5,
        scaleY: 0.5,
        opacity: 0,
        translateY: '80%',

        easing: 'easeOutQuint',
        duration: 200,
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

export const anim_hero_take_damage = () => {
    const elem_hp = document.querySelector('.hp')
    const pd = get_godlike.player_data()
    elem_hp.textContent = pd.hp
}

export const anim_new_weapon = (key) => {
    const card = '#card-hand' + key
    anime({
        targets: card,
        duration: 100,
        easing: 'easeOutQuad',
        opacity: 1,
        scale: 1,
    })
}

