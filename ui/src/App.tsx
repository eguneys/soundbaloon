import { onMount } from "solid-js";
import { app as oscii } from './synth/main'
import './App.scss'
import initWorklet from "./synth/worklet";

function App() {

  let workletCtx = {
    playMusic: () => { },
    getWindow: () => new Float32Array(0)
  }

  let initialized = false
  function initWorkletContext() {
    if (!initialized) {
      initialized = true
      initWorklet().then(ctx => {
        workletCtx.getWindow = ctx.getWindow
        workletCtx.playMusic = ctx.playMusic
      })
    }
  }

  onMount(() => {
    document.addEventListener('click', initWorkletContext)
  })

  return (<>
    <div class='main-wrap google-sans-flex-500'>
      <h1>Sound Bubble Music Tracker</h1>
      <button onClick={() => workletCtx.playMusic()}>Loop</button>
      <div class='main-osci'>
        <Osci workletCtx={workletCtx} />
      </div>
    </div>
  </>)
}


function Osci(props: { workletCtx: { playMusic: () => void, getWindow: () => Float32Array } }) {

  let osciRef!: HTMLDivElement;

  onMount(() => {
    oscii(osciRef, props.workletCtx)
  })

  return (<>
    <div ref={osciRef} class='osci-wrap'></div>
  </>)
}

export default App
