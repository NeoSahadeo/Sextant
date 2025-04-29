// Nah bro, the loading is wack
// what do you mean it takes this long
export default () => {
	const observer = new MutationObserver(() => {
		(window as any).electron.load_patches();

		observer.disconnect();
	});
	observer.observe(document.body, {
		subtree: true,
		childList: true,
	});
};
