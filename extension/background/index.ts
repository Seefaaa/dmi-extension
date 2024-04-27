import { onHeadersReceived } from './onHeadersReceived';
import type { Message } from '../common/messaging';

import initWasm, { greet, parse_dmi } from '../../wasm/pkg/wasm';
import '../../wasm/pkg/wasm_bg.wasm';

chrome.webRequest.onHeadersReceived.addListener(
	onHeadersReceived,
	{ urls: ['*://*/*'] },
	['responseHeaders', 'blocking', 'extraHeaders']
);

let wasmInitialized = false;

async function initializeWasm() {
	if (!wasmInitialized) {
		await initWasm();
		wasmInitialized = true;
	}
}

const reply = (sender: chrome.runtime.MessageSender, type: string, content: any) => chrome.tabs.sendMessage(sender.tab!.id!, { type, content })

chrome.runtime.onMessage.addListener(async (message: Message<string>, sender, sendResponse) => {
	switch (message.type) {
		case 'parse-dmi':
			await initializeWasm();
			const content = await parse_dmi(message.content);
			reply(sender, message.type, content);
			break;
	}
});
