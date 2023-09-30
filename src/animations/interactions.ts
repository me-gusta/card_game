import anime from "animejs/lib/anime.es.js";


export const bounce_card = (card) => {
    anime.timeline({
        targets: card.parentNode,
    }).add({
        scaleX: 0.8,
        scaleY: 0.9,

        easing: 'easeOutQuint',
        duration: 100,
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


export const attacking_card = (card) => {
    anime.timeline({
        targets: card,
    }).add({
        // scaleX: 0.9,
        scaleY: 0.8,
        translateY: '30%',

        easing: 'easeOutQuint',
        duration: 100,
    })
        .add(
        {
            scaleX: 1,
            scaleY: 1,
            translateY: '0%',
            easing: 'easeInQuint',
            duration: 200
        }
    )
}


export const collect_card = (card) => {
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


