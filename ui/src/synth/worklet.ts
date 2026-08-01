import synthWorkletUrl from './bypass?worker&url'
import scopeWorkletUrl from './scope?worker&url'

export default async function initWorklet() {
    let cx = new AudioContext()
    let bypassNode: AudioWorkletNode
    let scopeNode: AudioWorkletNode


    const Buffer_Size = 65536
    const SampleBuffer = new Float32Array(Buffer_Size)
    let writeIndex = 0

    await cx.audioWorklet.addModule(scopeWorkletUrl)
    await cx.audioWorklet.addModule(synthWorkletUrl)

    scopeNode = new AudioWorkletNode(cx, 'scope')
    scopeNode.port.onmessage = (event) => {
        let samples = event.data

        for (let i = 0; i < samples.length; i++) {
            SampleBuffer[writeIndex] = samples[i]
            writeIndex += 1
            writeIndex %= Buffer_Size
        }
    }

    bypassNode = new AudioWorkletNode(cx, 'bypass')

    /*
    let gainParam = bypassNode.parameters.get('gain')!
    gainParam.value = 1.0
    gainParam.linearRampToValueAtTime(0.0, 5.0)
    */

    bypassNode.connect(scopeNode)
    scopeNode.connect(cx.destination)

    await new Promise<void>(resolve => {
        bypassNode.port.onmessage = (event) => {
            if (event.data === 'ready') {
                resolve()
            }

        }
    })

    function playMusic() {
        let score = new Float32Array([62, 0, 0.6])
        bypassNode.port.postMessage({ playMusic: score })
    }

    function findTrigger(buffer: Float32Array, start: number, size: number) {

        let threshold = 0.01
        for (let i = 1; i < size; i++) {

            const a = buffer[(start + i - 1) % Buffer_Size]
            const b = buffer[(start + i) % Buffer_Size]

            // rising edge trigger

            if (a < threshold && b >= threshold) {
                //if (a < 0 && b >= 0) {
                return (start + i) % Buffer_Size
            }
        }

        return start
    }

    const Window_Size = 2048

    function extractWindow(triggerIndex: number) {

        const out = new Float32Array(Window_Size)

        for (let i = 0; i < Window_Size; i++) {

            out[i] = SampleBuffer[
                (triggerIndex + i) % Buffer_Size
            ]
        }

        return out
    }

    function getWindow() {
        const searchStart = (writeIndex - 4096 + Buffer_Size) % Buffer_Size

        let trigger = findTrigger(SampleBuffer, searchStart, 4096)

        const window = extractWindow(trigger)

        return window
    }


    return {
        playMusic,
        getWindow
    }
}