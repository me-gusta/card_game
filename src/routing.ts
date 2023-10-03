export const init_route = async (route) => {
    const main = document.querySelector('#main')
    main.innerHTML = route.content
    await route.init()
}