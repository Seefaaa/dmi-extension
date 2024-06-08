const MIME_TYPES = [
	'application/octet-stream',
	'application/force-download',
	'binary/octet-stream',
];

export function onHeadersReceived(
	details: chrome.webRequest.WebResponseHeadersDetails
): chrome.webRequest.BlockingResponse | void {
	if (details.tabId !== -1) {
		if (details.responseHeaders && isDmi(details)) {
			setHeader(details.responseHeaders, 'Content-Type', 'image/png');
			setHeader(details.responseHeaders, 'Content-Security-Policy', '');

			// chrome.tabs.executeScript(
			// 	details.tabId,
			// 	{
			// 		file: chrome.runtime.getURL('../content/file.ts'),
			// 		runAt: 'document_start',
			// 	},
			// 	(result) => {
			// 		chrome.tabs.sendMessage(details.tabId, 'hello from background!');
			// 	}
			// );

			return {
				responseHeaders: details.responseHeaders,
			};
		}
	}
}

function isDmi(details: chrome.webRequest.WebResponseHeadersDetails): boolean {
	const contentType = getHeader(details.responseHeaders!, 'Content-Type');

	if (
		contentType?.value &&
		MIME_TYPES.includes(contentType.value) &&
		details.url.split('?')[0].endsWith('.dmi')
	) {
		return true;
	}

	return false;
}

function getHeader(
	headers: chrome.webRequest.HttpHeader[],
	name: string
): chrome.webRequest.HttpHeader | undefined {
	return headers.find(
		(header) => header.name.toLowerCase() === name.toLowerCase()
	);
}

function setHeader(
	headers: chrome.webRequest.HttpHeader[],
	name: string,
	value: string
): void {
	const header = getHeader(headers, name);

	if (header) {
		header.value = value;
	} else {
		headers.push({ name, value });
	}
}

chrome.webRequest.onHeadersReceived.addListener(
	onHeadersReceived,
	{ urls: ['<all_urls>'], types: ['main_frame'] },
	['responseHeaders', 'blocking']
);
