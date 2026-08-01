let cx = new AudioContext()
let audioWorklet = new AudioWorklet()
let bypassNode: AudioWorkletNode

await audioWorklet.addModule('bypass.js').then(() => {
    bypassNode = new AudioWorkletNode(cx, 'bypass')

    /*
    let gainParam = bypassNode.parameters.get('gain')!
    gainParam.value = 1.0
    gainParam.linearRampToValueAtTime(0.0, 5.0)
    */

    bypassNode.connect(cx.destination)

    return new Promise<void>(resolve => {
        bypassNode.port.onmessage = (event) => {
            if (event.data === 'ready') {
                resolve()
            }
        }
    })
})

export function playMusic() {
    bypassNode.port.postMessage('playMusic', {})
}