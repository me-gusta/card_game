import anime from "animejs/lib/anime.es.js";

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