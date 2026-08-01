class ScopeProcessor extends AudioWorkletProcessor {


    process(inputs: Float32Array[][], outputs: Float32Array[][], _parameters: Record<string, Float32Array>) {
        const input = inputs[0]
        const output = outputs[0]

        if (input.length > 0) {
            const channel = input[0]
            this.port.postMessage(channel)
        }

        output[0].set(input[0])
        return true
    }

}

registerProcessor('scope', ScopeProcessor)