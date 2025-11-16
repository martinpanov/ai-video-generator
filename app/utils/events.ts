export function subscribe(eventName: string, listener: () => void) {
  document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName: string, listener: () => void) {
  document.removeEventListener(eventName, listener);
}

export function dispatchEvent(eventName: string) {
  const event = new CustomEvent(eventName);
  document.dispatchEvent(event);
}