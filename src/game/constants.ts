import {Vector} from "../esc/vector";

export let WIDTH = 420
export let HEIGHT = 650

export const board_height = 200

export const set_dimentions = (width, height) => {
        WIDTH = width;
        HEIGHT = height;

}

// export const window_size = Vector.new(WIDTH, HEIGHT + 50)

export const CENTER = new Vector(WIDTH / 2, HEIGHT / 2)

export const WORLD_BORDER = {
    x: 1500,
    y: 1200
}

export const WALL_SIZE = 6
export const LINE_WIDTH = 140 * 3
export const TILE_SIZE = 40
export const TILE_GAP = 10