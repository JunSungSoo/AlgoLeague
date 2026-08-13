const loadingStartEvent = "algoleague-loading-start";
const loadingEndEvent = "algoleague-loading-end";

export function startGlobalLoading() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(loadingStartEvent));
}

export function endGlobalLoading() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(loadingEndEvent));
}

export const globalLoadingEvents = {
    start: loadingStartEvent,
    end: loadingEndEvent,
};
