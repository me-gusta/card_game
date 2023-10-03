export const show_debug_data = (...data) => {
    let text = ''
    for (let d of data) {
        text += JSON.stringify(d) + '\n'
    }
    document.querySelector('.debug-text').textContent = text.slice(0, text.length - 1)
}