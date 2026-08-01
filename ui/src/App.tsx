import { createEffect, createMemo, For, onCleanup, onMount } from "solid-js";
import { app as oscii } from './synth/main'
import './App.scss'
import initWorklet from "./synth/worklet";
import { TrackerProvider, useState } from "./state/State";

function App() {

  return (<>
    <TrackerProvider>
      <div class='main-wrap google-sans-flex-500'>
        <Main />
      </div>
    </TrackerProvider>
  </>)
}

function Main() {

  let [{ tracker, }, { tracker_actions: { delete_backspace_tracker_note, delete_tracker_note, set_playing_row, set_tracker_note, set_tracker_cursor, insert_tracker_note, set_tracker_note_octaveup, set_tracker_note_octavedown } }] = useState()

  let workletCtx = {
    playMusic: (_score: Float32Array) => { },
    getWindow: () => new Float32Array(0)
  }

  let initialized = false
  async function initWorkletContext() {
    if (!initialized) {
      initialized = true
      return initWorklet().then(ctx => {
        workletCtx.getWindow = ctx.getWindow
        workletCtx.playMusic = ctx.playMusic
      })
    }
  }

  onMount(() => {
    document.addEventListener('keydown', async (e) => {
      await initWorkletContext()
      if (e.code === 'Space') {
        e.preventDefault()
        if (tracker.playing_row !== undefined) {
          workletCtx.playMusic(new Float32Array([]))
          set_playing_row(undefined)
        } else {
          set_playing_row(0)
          workletCtx.playMusic(tracker.playMusicScore)
        }
      }
      if (e.key === 'Backspace') {
        delete_backspace_tracker_note()
      }
      if (e.key === 'Delete') {
        delete_tracker_note()
      }
      if (e.key === 'Insert') {
        insert_tracker_note()
      }
      if (e.key === 'PageUp') {
        e.preventDefault()
        set_tracker_note_octaveup()
      }
      if (e.key === 'PageDown') {
        e.preventDefault()
        set_tracker_note_octavedown()
      }
      const note = parseNote(e.key)
      if (note !== undefined) {
        set_tracker_note(note)
        set_tracker_cursor(tracker.tracker_cursor.row + 1, tracker.tracker_cursor.channel)
        workletCtx.playMusic(new Float32Array([note, 0, 0.5]))
      }

      if (e.key === 'ArrowUp') {
        set_tracker_cursor(Math.max(0, tracker.tracker_cursor.row - 1), tracker.tracker_cursor.channel)
      }
      if (e.key === 'ArrowDown') {
        set_tracker_cursor(Math.min(63, tracker.tracker_cursor.row + 1), tracker.tracker_cursor.channel)
      }
      if (e.key === 'ArrowLeft') {
        set_tracker_cursor(tracker.tracker_cursor.row, Math.max(0, tracker.tracker_cursor.channel - 1))
      }
      if (e.key === 'ArrowRight') {
        set_tracker_cursor(tracker.tracker_cursor.row, Math.min(3, tracker.tracker_cursor.channel + 1))
      }
    })
    document.addEventListener('click', initWorkletContext)
    onCleanup(() => {
      document.removeEventListener('click', initWorkletContext)
    })
  })

  return (<>
    <main>
      <div class='top-bar'>
        <h2>Sound Bubble Music Tracker</h2>
        <button onClick={() => workletCtx.playMusic(tracker.playMusicScore)}>Play (Space)</button>
      </div>
      <div class='pattern-wrap'>
        <Pattern />
      </div>
      <div class='main-osci'>
        <Osci workletCtx={workletCtx} />
      </div>
      <div class='tracker-wrap'>
        <Tracker />
      </div>
    </main>
  </>
  )
}

const list = Array(64).fill(0)

function Tracker() {
  return (<>
    <div class='tracker'>
      <div class='tracker-header'>
        <For each={Array(4).fill(0)}>{(_channel) =>
          <div class='header-info'>Pulse</div>
        }</For>
      </div>
      <div class='list'>
        <For each={list}>{(_item, i) =>

          <div class='tracker-row' classList={{ 'playing': useState()[0].tracker.playing_row === i() }}>
            <div class='index'>{i() + 1}</div>
            <div class='tracker-note'>
              <For each={Array(4).fill(0)}>{(_, j) =>

                <TrackerNote row={i()} channel={j()} />
              }</For>
            </div>
          </div>
        }</For>
      </div>
    </div>
  </>)
}

function TrackerNote(props: { row: number, channel: number }) {
  const [{ tracker }, { tracker_actions: { set_tracker_cursor } }] = useState()


  onMount(() => {
    createEffect(() => {
      let cursor = tracker.tracker_cursor
      if (tracker.playing_row !== undefined) {
        if (tracker.playing_row === props.row) {
          $ref.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' })
        }
      } else {

        if (cursor.row === props.row && cursor.channel === props.channel) {

          $ref.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' })
        }
      }
    })
  })

  const isActive = createMemo(() => props.row === tracker.tracker_cursor.row && props.channel === tracker.tracker_cursor.channel)
  const isPlaying = createMemo(() => props.row === tracker.playing_row)

  let $ref!: HTMLDivElement
  return (<>
    <div ref={$ref} onClick={() => set_tracker_cursor(props.row, props.channel)} class='note-wrap' classList={{ 'playing': isPlaying(), 'active': isActive() }}>
      <span class='note'>{midiToAsciNote(tracker.tracker[props.channel][props.row])}</span>
      <span class='volume'>-</span>
    </div>
  </>)
}

function midiToAsciNote(midi: number | undefined) {
  if (midi === undefined) return '-'
  if (midi === 0) return '-'
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const noteIndex = midi % 12
  return `${noteNames[noteIndex]}${octave}`
}


function Pattern() {
  return (<>
    <div class='pattern'>
      <div class='list'>
        <For each={list}>{(_item) =>
          <div class='pattern-note'>
            0
          </div>
        }</For>
      </div>
    </div>
  </>)
}



function Osci(props: { workletCtx: { playMusic: (score: Float32Array) => void, getWindow: () => Float32Array } }) {

  let osciRef!: HTMLDivElement;

  onMount(() => {
    oscii(osciRef, props.workletCtx)
  })

  return (<>
    <div ref={osciRef} class='osci-wrap'></div>
  </>)
}

export default App

function parseNote(key: string): number | undefined {
  const noteMap: { [key: string]: number } = {
    'a': 60, // C4
    'w': 61, // C#4
    's': 62, // D4
    'e': 63, // D#4
    'd': 64, // E4
    'f': 65, // F4
    't': 66, // F#4
    'g': 67, // G4
    'y': 68, // G#4
    'h': 69, // A4
    'u': 70, // A#4
    'j': 71, // B4
    'k': 72, // C5
  };

  return noteMap[key];
}