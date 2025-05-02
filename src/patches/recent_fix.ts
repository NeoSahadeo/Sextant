// Moves the Recent Tab to an actually decent
// position. And removes the braindead topbar

export default () => {
	const main = () => {
		const element = document.querySelector("[class*=bar] [class*=trailing_]");
		const support = document.querySelector(
			"[href='https://support.discord.com']",
		);
		const sidebar = document.getElementById("sextant_html_sidebar");
		const bar = document.querySelector("[class*='base_'] [class*='bar_']");

		if (element && sidebar && support && bar) {
			sidebar.appendChild(element);
			observer.disconnect();
			support.remove();
			bar.remove();
			window.electron.loaded_patch("recent_fix", 0);
		}
	};

	const observer = new MutationObserver(main);

	observer.observe(document.body!.parentNode!, {
		subtree: true,
		childList: true,
	});
};
