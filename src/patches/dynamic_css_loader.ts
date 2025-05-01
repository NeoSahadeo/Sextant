export default () => {
	const inject_css = async () => {
		const data = await (window as any).electron.load_css();

		for (let x = 0; x < data[1]; x++) {
			try {
				const style_element = document.getElementById(`sextant_css_${x}`);
				if (style_element) style_element.remove();
			} catch { }
		}

		document.body.insertAdjacentHTML("afterbegin", data[0]);
	};

	// This does delete a bunch of stuff I don't
	// like and puts my button in there.
	// Might change to be optional
	const inject_button = () => {
		const stacks = document.querySelectorAll(
			"[class*='stack_'] > [class*='stack_']",
		);
		const tutors = document.querySelector('[class*="tutorialContainer__"]');

		const guild = document.querySelector('[data-list-id="guildsnav"]');
		const nav = document.querySelectorAll(
			"nav[class*='guilds_'] [class*='itemsContainer_'] [class*='stack_']",
		)[0];

		if (nav) {
			nav.innerHTML = "";
			observer.disconnect();

			// Replace the guild node with a div
			// Trying to modify it at runtime crashes discord; idk why
			const div = document.createElement("div");
			div.style = "display: flex; flex-direction: column; gap: 1em";
			guild?.replaceWith(div);

			div.appendChild(tutors!);
			stacks.forEach((e) => {
				div.appendChild(e);
			});

			// Create my button for dynamic css!
			const css_button = document.createElement("button");
			css_button.innerText = "RELOAD CSS";
			css_button.onclick = inject_css;
			div.appendChild(css_button);
		}
	};

	const observer = new MutationObserver(() => {
		inject_button();
		inject_css();
	});

	observer.observe(document.body!.parentNode!, {
		subtree: true,
		childList: true,
	});
};
