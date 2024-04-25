import { displayName, description, version } from '../package.json';

export default {
	manifest_version: 2,
	name: displayName,
  description,
	version,
	permissions: [
		'webRequest',
		'webRequestBlocking',
    '<all_urls>',
	],
	background: {
		scripts: ['background.ts'],
	},
	content_scripts: [
		{
			matches: ['http://github.com/*', 'https://github.com/*'],
			run_at: 'document_start',
			js: ['content/github.ts'],
			all_frames: true,
		},
		{
			matches: ['*://*/*'],
			run_at: 'document_start',
			js: ['content/file.ts'],
			all_frames: true,
		},
	],
	web_accessible_resources: ['pages/*/index.html', '*.wasm'],
	content_security_policy: "script-src 'self' 'wasm-eval'; object-src 'self'"
} satisfies chrome.runtime.ManifestV2;
