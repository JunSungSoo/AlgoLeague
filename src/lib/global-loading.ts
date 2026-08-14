const LOADING_START_EVENT = "algoleague-loading-start";
const LOADING_END_EVENT = "algoleague-loading-end";

export function startGlobalLoading() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(LOADING_START_EVENT));
}

export function endGlobalLoading() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(LOADING_END_EVENT));
}

export const GLOBAL_LOADING_EVENTS = {
    start: LOADING_START_EVENT,
    end: LOADING_END_EVENT,
};
