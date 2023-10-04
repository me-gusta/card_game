import anime from "animejs/lib/anime.es.js";
import {CardType, CardVariant, E_CardType} from "../game/components";

export const sleep = ms => new Promise(r => setTimeout(r, ms))


export function new_element(htmlString, styles = undefined) {
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()

    const elem = (div.firstChild as HTMLElement)
    anime.set(elem, styles)

    return elem
}

export const img_url = (name: string, for_css = false) => {
    const filename = name.includes('.') ? `/assets/images/${name}` : `/assets/images/${name}.png`
    if (for_css) {
        return `url("${filename}")`
    } else {
        return filename
    }
}
export const img_css = (name: string, for_css = false) => {
    return img_url(name, true)
}

export const extract_digits = (str) => {
    return str.match(/\d+/)[0]
}

export const find_image = (ent, for_css = false) => {
    const folders = new Map([
        [E_CardType.food, 'food'],
        [E_CardType.weapon, 'weapons'],
        [E_CardType.crate, 'misc'],
        [E_CardType.coin, 'misc'],
        [E_CardType.mob, 'mobs']
    ])
    const type = ent.get(CardType)
    const variant = ent.get(CardVariant)

    const folder = folders.get(type)
    const file_name = variant || type
    const ext = type === E_CardType.mob ? 'png' : 'png'

    return img_url(
        `${folder}/${file_name}.${ext}`,
        for_css
    )
}


export const q = (selector) : HTMLElement => document.querySelector(selector)