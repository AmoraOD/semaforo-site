async function download (url, filename)
{
	const response = await fetch(url);
	
	const blob = await response.blob();
	
	const objUrl = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	
    a.href = objUrl;
	a.download = filename;
	document.body.appendChild(a);
	
	a.click();
	a.remove();
}

export default download;