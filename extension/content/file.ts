console.log('file.ts injected');

chrome.runtime.onMessage.addListener(async (message) => {
	window.dmi = message;

	const root = document.createElement('div');
	root.id = 'root';
	document.body.innerHTML = '';
	document.body.appendChild(root);

	const fileName = location.pathname.split('/').pop();
	document.title = `${fileName} (${message.width}×${message.height})`;

	const { default: css } = await import('../pages/viewer/index.css');
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);

	await import('../pages/viewer/index.tsx');
});

chrome.runtime.sendMessage(location.href);
