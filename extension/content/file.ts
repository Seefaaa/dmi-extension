const url = new URL(location.href);

if (url.pathname.endsWith('.dmi') && url.searchParams.has('view')) {
	const fileName = url.pathname.split('/').pop();

	if (fileName && fileName.length > 0) {
		document.title = fileName;

		url.searchParams.delete('view');
		history.replaceState({}, '', url.pathname + url.search);
	}
}
