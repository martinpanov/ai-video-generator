export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let isExecuting = false;

  return function executedFunction(...args: Parameters<T>) {
    if (isExecuting) {
      return;
    }

    const later = () => {
      timeout = null;
      isExecuting = false;
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    isExecuting = true;
    func(...args);
    timeout = setTimeout(later, wait);
  };
}