export function subscribe(eventName: string, listener: (event?: CustomEvent) => void) {
  document.addEventListener(eventName, listener as EventListener);
}

export function unsubscribe(eventName: string, listener: (event?: CustomEvent) => void) {
  document.removeEventListener(eventName, listener as EventListener);
}

export function dispatchEvent(eventName: string, detail?: any) {
  const event = new CustomEvent(eventName, { detail });
  document.dispatchEvent(event);
}