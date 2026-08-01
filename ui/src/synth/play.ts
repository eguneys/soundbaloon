export function _init() {
    first_update_called = false
}

let first_update_called = false
export function _update(_dt: number) {
    first_update_called = true
}

export function _render() {
    if (!first_update_called) return

    let sy = vheight / 360
    let sx = sy
    cx.setTransform(sx, 0, 0, sy, 0, 0)
    cx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    cx.fillRect(0, 0, 640, 360)
}


let cx: CanvasRenderingContext2D
export function _set_ctx(ctx: CanvasRenderingContext2D) {
    cx = ctx
}

let vheight = 0
export function _set_viewport(_top: number, _left: number, _width: number, height: number) {
    vheight = height
}


export function _set_canvas(_canvas: HTMLCanvasElement) {
}

export function _load() {

}