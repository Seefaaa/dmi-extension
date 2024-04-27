export type Message<T> = {
	type: string
	content: T,
}

export async function asyncMessage<T>(type: string, content?: any) {
	return new Promise<T>((resolve) => {
		chrome.runtime.sendMessage({ type, content });

		const callback = (response: Message<T>) => {
			if (response.type === type) {
				chrome.runtime.onMessage.removeListener(callback);
				resolve(response.content);
			}
		};

		chrome.runtime.onMessage.addListener(callback);
	})
}
