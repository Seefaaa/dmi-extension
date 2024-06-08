import { displayName, description, version } from '../package.json';

export default {
	manifest_version: 2,
	name: displayName,
	description,
	version,
	permissions: ['webRequest', 'webRequestBlocking', 'activeTab', '<all_urls>'],
	background: {
		scripts: ['background/index.ts', 'background/onHeadersReceived.ts'],
		persistent: true,
	},
	content_scripts: [
		{
			js: ['content/file.ts'],
			matches: ['*://*/*.dmi'],
		},
	],
	web_accessible_resources: ['*.wasm'],
	content_security_policy: "script-src 'self' 'wasm-unsafe-eval'",
} satisfies chrome.runtime.ManifestV2;
