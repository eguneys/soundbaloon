import { WasmSynth } from "./wasmsynth"

class Bypass extends AudioWorkletProcessor {

    synth: WasmSynth
    createdAt: number

    constructor() {
        super()

        this.synth = new WasmSynth()

        this.port.onmessage = (event) => {
            if (event.data.playMusic) {
                this.synth.playMusic(event.data.playMusic, currentTime)
            }
        }

        this.createdAt = currentTime

        this.port.postMessage('ready')
    }

    static get parameterDescriptors() {
        return [{
            name: 'gain',
            defaultValue: 0.0
        }]
    }

    process(_inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>) {

        let output = outputs[0]
        const channel = output[0]

        //let gainValues = parameters['gain']


        //let sampleSinceStart = (frame + i) - this.startFrame
        //const timeSinceStart = sampleSinceStart / sampleRate
        //let sampleI = this.synth.process(i)

        for (let i = 0; i < channel.length; ++i) {
            //channel[i] = sample[i] * gainValues[i]

        }
        return true
    }
}

registerProcessor('bypass', Bypass)