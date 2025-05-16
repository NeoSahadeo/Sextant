export const dispatcher: SextantPlugin = {
	name: "BetterStream",
	load() {
		return () => {
			class EventListener {
				listeners: any;
				constructor() {
					this.listeners = {};
				}
				addEventListener(event: string, callback: (...args: any) => void) {
					if (!this.listeners[event]) {
						this.listeners[event] = [];
					}
					this.listeners[event].push(callback);
				}
				removeEventListener(event: string, callback: () => void) {
					if (this.listeners[event]) {
						this.listeners[event] = this.listeners[event].filter(
							(listener: () => void) => listener !== callback,
						);
					}
				}
				dispatchEvent(event: string, data: any) {
					if (this.listeners[event]) {
						this.listeners[event].forEach((callback: (data: any) => void) =>
							callback(data),
						);
					}
				}
			}

			window.sextant_events = new EventListener();
		};
	},
};
