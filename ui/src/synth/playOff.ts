
export const playBuffer = (cx: AudioContext, buffer: AudioBuffer, gain: number = 0.8, loop = false) => {
    let source = cx.createBufferSource(),
        gainNode = cx.createGain()

    source.buffer = buffer;
    source.connect(gainNode);

    source.loop = loop;
    gainNode.gain.value = gain;
    source.start();
    return () => {
        source.stop()
    }
};