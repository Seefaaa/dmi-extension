import React, { useEffect, useState } from 'react';

export default function App() {
	const [fileUrl, setFileUrl] = useState<string | null>(null);

	useEffect(() => {
		const url = decodeURIComponent(location.href.split('?=')[1]);

		history.replaceState({}, '', '/');

		if (url.length === 0) {
			window.close();
			return;
		}

		const filename = url.split('/').pop();

		if (filename === undefined) {
			window.close();
			return;
		}

		document.title = filename;

		setFileUrl(url);
	}, []);

	return <div>{fileUrl}</div>;
}
