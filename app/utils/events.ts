export function subscribe(eventName: string, listener: (event?: CustomEvent) => void) {
  document.addEventListener(eventName, listener as EventListener);
}

export function unsubscribe(eventName: string, listener: (event?: CustomEvent) => void) {
  document.removeEventListener(eventName, listener as EventListener);
}

export function dispatchEvent<T = undefined>(eventName: string, detail?: T) {
  const event = new CustomEvent<T>(eventName, { detail });
  document.dispatchEvent(event);
}