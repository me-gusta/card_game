import anime from "animejs/lib/anime.es.js";
import {InHand} from "../game/components";


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


export const anim_collect_card = (card) => {
    anime.timeline({
        targets: card,
    }).add({
        scaleX: 0.5,
        scaleY: 0.5,
        opacity: 0,
        translateY: '80%',

        easing: 'easeOutQuint',
        duration: 300,
    })
}


