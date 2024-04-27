import { asyncMessage } from '../common/messaging';

const url = new URL(location.href);

if (url.pathname.endsWith('.dmi') && url.searchParams.has('view')) {
	document.body.innerHTML = '';

	url.searchParams.delete('view');
	history.replaceState({}, '', url.pathname + url.search);

	const root = document.createElement('div');
	root.id = 'root';

	document.body.appendChild(root);

	window.dmi = await asyncMessage<any>('parse-dmi', url.href);

	const fileName = url.pathname.split('/').pop();

	document.title = `${fileName} (${window.dmi.width}×${window.dmi.height})`;

	const { default: css } = await import('../pages/viewer/index.css');

	const style = document.createElement('style');
	style.innerHTML = css;

	document.head.appendChild(style);

	import('../pages/viewer/index.tsx');
}
