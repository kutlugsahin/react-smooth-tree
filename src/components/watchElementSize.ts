export interface Size {
    x: number;
    y: number;
}

export interface SizeWatcher {
    dispose: () => void;
}

export function watchElementSize(element: HTMLElement, callback: (size: Size) => void, debounce: number = 100): SizeWatcher {
    let frame: number;
    let timeout: number;
    let width: number;
    let height: number;

    function checkElementSize(): void {
        if (width !== element.clientWidth || height !== element.clientHeight) {
            width = element.clientWidth;
            height = element.clientHeight;
            callback({
                x: width,
                y: height,
            });
        }
    }

    function start(): void {
        frame = requestAnimationFrame(() => {
            checkElementSize();
            timeout = window.setTimeout(() => {
                start();
            }, debounce);
        });
    }

    start();

    return {
        dispose: (): void => {
            cancelAnimationFrame(frame);
            clearTimeout(timeout);
        },
    };
}
