const MIME_TYPES = [
	'application/octet-stream',
	'application/force-download',
	'binary/octet-stream',
];
const DMI_EXTENSION = '.dmi';
const HEADER_CONTENT_TYPE = 'Content-Type';

function getHeader(
	headers: chrome.webRequest.HttpHeader[],
	name: string
): chrome.webRequest.HttpHeader | undefined {
	return headers.find(
		(header) => header.name.toLowerCase() === name.toLowerCase()
	);
}

function isDMI(url: string, headers: chrome.webRequest.HttpHeader[]): boolean {
	const contentType = getHeader(headers, HEADER_CONTENT_TYPE)!;

	if (contentType.value === undefined) {
		return false;
	}

	if (!MIME_TYPES.includes(contentType.value)) {
		return false;
	}

	if (!url.split('?')[0].endsWith(DMI_EXTENSION)) {
		return false;
	}

	return true;
}

function modifyHeaders(
	headers: chrome.webRequest.HttpHeader[]
): chrome.webRequest.HttpHeader[] {
	return headers.map((header) => {
		if (header.name.toLowerCase() === HEADER_CONTENT_TYPE.toLowerCase()) {
			return { name: HEADER_CONTENT_TYPE, value: 'image/png' };
		}

		return header;
	});
}

function onHeadersReceived(
	details: chrome.webRequest.WebResponseHeadersDetails
): chrome.webRequest.BlockingResponse | void {
	if (details.responseHeaders !== undefined) {
		if (isDMI(details.url, details.responseHeaders)) {
			const url = new URL(details.url);
			if (!url.searchParams.has('view')) {
				url.searchParams.set('view', '');
				return {
					redirectUrl: url.toString(),
				};
			} else {
				return {
					responseHeaders: modifyHeaders(details.responseHeaders),
				};
			}
		}
	}
}

chrome.webRequest.onHeadersReceived.addListener(
	onHeadersReceived,
	{ urls: ['*://*/*'] },
	['responseHeaders', 'blocking', 'extraHeaders']
);

import initWasm, { greet } from '../wasm/pkg';
import '../wasm/pkg/wasm_bg.wasm';

async function wasmMain() {
	await initWasm();
	greet('ahh');
}

wasmMain();
