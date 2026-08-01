export class WasmSynth {

    playMusic(_a: any, _startTime: number) {

    }

    createAudioBuffer = (cx: AudioContext, sampleRate = 44100) => {
        let length = 100
        let buffer = cx.createBuffer(1, length, sampleRate)

        let data = buffer.getChannelData(0)

        for (let j = 0; j < length; j++) {
            data[j] = sample[j]
        }
        return buffer
    }

}