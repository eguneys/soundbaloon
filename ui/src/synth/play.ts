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
    cx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    cx.fillRect(0, 0, 640, 360)



    let window = wx.getWindow()

    draw_samples(window, 640, 180, 140)
}


function draw_samples(samples: Float32Array, width: number, middle_y: number, height: number) {
    cx.strokeStyle = "#00ff88";
    cx.lineWidth = 4;
    cx.beginPath()

    for (let i = 0; i < samples.length; i++) {

        const x = i / samples.length * width

        const y =
            middle_y
            - samples[i] * height

        if (i === 0)
            cx.moveTo(x, y)
        else
            cx.lineTo(x, y)
    }

    cx.stroke()
}


export type WorkletContext = { getWindow: () => Float32Array }
let wx: WorkletContext
let cx: CanvasRenderingContext2D
export function _set_ctx(ctx: CanvasRenderingContext2D, wcx: WorkletContext) {
    cx = ctx
    wx = wcx;
}

let vheight = 0
export function _set_viewport(_top: number, _left: number, _width: number, height: number) {
    vheight = height
}


export function _set_canvas(_canvas: HTMLCanvasElement) {
}

export function _load() {

}