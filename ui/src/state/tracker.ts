import { makePersisted } from "@solid-primitives/storage"
import { createStore, type StoreReturn } from "solid-js/store"

export type State = {
    playing_row: number | undefined,
    tracker: number[][]
    tracker_cursor: RowChannel
    playMusicScore: Float32Array
    bpm: number
}

export type Actions = {
    set_playing_row(row: number | undefined): void
    set_tracker_cursor(x: number, y: number): void
    set_tracker_note(note: number): void
    delete_tracker_note(): void
    delete_backspace_tracker_note(): void
    insert_tracker_note(): void
    set_tracker_note_octaveup(): void
    set_tracker_note_octavedown(): void
    set_tracker_note_up(): void
    set_tracker_note_down(): void
}

export type Store = [State, Actions]

export type TrackerStore = {
    playing_row: number | undefined
    tracker: number[][]
    tracker_cursor: RowChannel
    bpm: number
}
export type RowChannel = { row: number, channel: number }

export function make_tracker(): Store {
    let [store, set_store] = makePersisted<TrackerStore, StoreReturn<TrackerStore>>(createStore<TrackerStore>({
        playing_row: undefined,
        tracker: [[], [], [], []],
        tracker_cursor: { row: 0, channel: 0 },
        bpm: 90
    }), { name: 'tracker-v1' })

    const durationSeconds = () => 60 / store.bpm / 4

    let state = {
        get bpm() {
            return store.bpm
        },
        get playing_row() {
            return store.playing_row
        },
        get tracker() {
            return store.tracker
        },
        get tracker_cursor() {
            return store.tracker_cursor
        },
        get playMusicScore() {
            let nextNoteTime = 0
            let buffer = []
            for (let i = 0; i < 64; i++) {
                buffer[i * 3] = store.tracker[0][i] ?? 0
                buffer[i * 3 + 1] = nextNoteTime
                buffer[i * 3 + 2] = durationSeconds()
                nextNoteTime += durationSeconds()
            }
            return new Float32Array(buffer)
        }
    }

    let stepPlaybackTimer: number | undefined
    function stepPlayback() {
        set_store('playing_row', store.playing_row! + 1)
        stepPlaybackTimer = setTimeout(stepPlayback, durationSeconds() * 1000)
    }

    let actions = {
        set_playing_row(v: number | undefined) {
            if (v === undefined) {
                clearTimeout(stepPlaybackTimer)
                stepPlaybackTimer = undefined
            } else {
                stepPlaybackTimer = setTimeout(stepPlayback, durationSeconds() * 1000)
            }
            set_store('playing_row', v)
        },
        set_tracker_cursor(row: number, channel: number) {
            if (row > 63) {
                return
            }
            set_store('tracker_cursor', { row, channel })
        },
        set_tracker_note(note: number) {
            let cursor = state.tracker_cursor
            let channel = 0
            set_store('tracker', channel, cursor.row, note)
        },
        delete_backspace_tracker_note() {
            let cursor = state.tracker_cursor
            if (cursor.row === 0) {
                return
            }
            set_store('tracker', 0, _ => _.toSpliced(cursor.row - 1, 1))
            set_store('tracker_cursor', 'row', cursor.row - 1)
        },
        delete_tracker_note() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, cursor.row, 0)
        },
        insert_tracker_note() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, _ => _.toSpliced(cursor.row, 0, 0))
        },
        set_tracker_note_octaveup() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, cursor.row, _ => midiNoteOctaveUp(_))
        },
        set_tracker_note_octavedown() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, cursor.row, _ => midiNoteOctaveDown(_))
        },
        set_tracker_note_up() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, cursor.row, _ => midiNoteUp(_))
        },
        set_tracker_note_down() {
            let cursor = state.tracker_cursor
            set_store('tracker', 0, cursor.row, _ => midiNoteDown(_))
        }

    }
    return [state, actions]
}

function midiNoteOctaveUp(midi: number) {
    return midi + 12
}

function midiNoteOctaveDown(midi: number) {
    return midi - 12
}

function midiNoteUp(midi: number) {
    return midi + 1
}

function midiNoteDown(midi: number) {
    return midi - 1
}