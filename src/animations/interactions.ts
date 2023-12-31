import anime from "animejs/lib/anime.es.js";
import {CardVariant, EffectPoisoned, InHand, OnBoard, Value} from "../game/components";
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
        easing: 'easeOutSine',
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
    anime({
        targets: '.statistics-hp .icon',
        duration: 100,
        easing: 'easeOutSine',
        scale: 0.8,
        direction: 'alternate',
        complete: () => {
            anime.set('.statistics-hp .icon', {
                scale: 1
            })
        }
    })
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
        duration: 50,
        easing: 'easeOutSine',
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
        easing: 'easeOutSine',
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
        easing: 'easeOutSine',
        translateX: '-110%'
    })
}


export const anim_deal_damage = (ent) => {
    const key = ent.get(OnBoard)
    const card = q('#card-' + key)
    console.log('anim_deal_damage')
    console.log(card, ent.get(Value))
    console.log()
    const element_value = card.querySelector('.card-value')

    console.log(document.querySelector("#card-"+ key + " .card-value"))
    anime.set(document.querySelectorAll("#card-"+ key + " .card-value"), {
        innerHTML: ent.get(Value),
    });

    anim_bounce_card(card)
}

export const anim_poison = () => {
    const godlike = get_godlike.godlike()
    const elem = q('.statistics-poison')
    let opacity
    if (godlike.has(EffectPoisoned)) {
        opacity = 1
        console.log(godlike.get(EffectPoisoned))
        q('.poison').textContent = godlike.get(EffectPoisoned)
        anime({
            targets: '.statistics-poison .icon',
            duration: 100,
            easing: 'easeOutSine',
            scale: 1.3,
            direction: 'alternate'
        })
    } else {
        opacity = 0
    }
    anime({
        targets: elem,
        duration: 100,
        easing: 'easeOutSine',
        opacity: opacity
    })
}