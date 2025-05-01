export default () => {
	const observer = new MutationObserver(() => {
		const to_keep = document.querySelectorAll(
			"[class*='stack_'] > [class*='stack_']",
		);

		let nav = document.querySelectorAll(
			"nav[class*='guilds_'] [class*='itemsContainer_'] [class*='stack_']",
		)[0];
		if (nav) {
			nav.innerHTML = "";
			// to_keep.forEach((e) => {
			// 	nav.appendChild(e);
			// });
		}
	});

	observer.observe(document.body!.parentNode!, {
		subtree: true,
		childList: true,
	});
};
