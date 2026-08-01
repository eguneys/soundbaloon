import { onMount } from "solid-js";
import { app as oscii } from './synth/osci'
import './App.scss'

function App() {
  return (<>
    <div class='main-wrap google-sans-flex-500'>
      <h1>Sound Bubble Music Tracker</h1>
      <button>Loop</button>
      <div class='main-osci'>
        <Osci />
      </div>
    </div>
  </>)
}


function Osci() {

  let osciRef!: HTMLDivElement;

  onMount(() => {
    oscii(osciRef)
  })

  return (<>
    <div ref={osciRef} class='osci-wrap'></div>
  </>)
}

export default App
