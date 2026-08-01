import { createContext, type JSX, useContext } from "solid-js"
import { type State, type Actions, make_tracker } from './tracker'

export const useState = () => useContext(TrackerContext)!

const TrackerContext = createContext<TrackerStore>()

type TrackerState = {
    tracker: State
}

type TrackerActions = {
    tracker_actions: Actions
}

export type TrackerStore = [TrackerState, TrackerActions]



export const TrackerProvider = (props: { children: JSX.Element }) => {

    const [tracker, tracker_actions] = make_tracker()

    const state = {
        tracker,
    }

    const actions = {
        tracker_actions,
    }

    const store: TrackerStore = [state, actions]

    return <TrackerContext.Provider value={store}>
        {props.children}
    </TrackerContext.Provider>
}