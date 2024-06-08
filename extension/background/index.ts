import initializeWasm, { parse_dmi as parse } from '../../wasm/pkg/wasm';
import '../../wasm/pkg/wasm_bg.wasm';

let wasmInitialized = false;

chrome.runtime.onMessage.addListener(async (message, sender) => {
	if (!sender.tab?.id) {
		return;
	}

	if (!wasmInitialized) {
		await initializeWasm();
		wasmInitialized = true;
	}

	chrome.tabs.sendMessage(sender.tab.id, await parse(message));
});
