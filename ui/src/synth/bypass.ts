import { WasmCore } from "./wasmcore"
import { WasmSynth } from "./wasmsynth"

class Bypass extends AudioWorkletProcessor {

    synth!: WasmSynth
    createdAt: number

    constructor() {
        super()

        WasmCore.init(sampleRate).then(core => {
            this.synth = new WasmSynth(core, sampleRate)
            this.port.postMessage('ready')
        })

        this.port.onmessage = (event) => {
            if (event.data.playMusic) {
                this.synth.playMusic(event.data.playMusic.score, event.data.playMusic.dur, currentTime)
            }
        }

        this.createdAt = currentTime

    }

    static get parameterDescriptors() {
        return [{
            name: 'gain',
            defaultValue: 0.0
        }]
    }

    process(_inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>) {
        const channel = outputs[0][0]
        for (let i = 0; i < channel.length; ++i) {
            channel[i] = this.synth.process(currentFrame + i)
        }
        return true
    }
}

registerProcessor('bypass', Bypass)