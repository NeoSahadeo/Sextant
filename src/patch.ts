import { logger } from "./utils";
import auto_login from "./patches/auto_login";
import stream from "./patches/stream";
import dynamic_css_loader from "./patches/dynamic_css_loader";
import reload from "./patches/reload";
import recent_fix from "./patches/recent_fix";

const patch = () => {
	let patches = [];

	// load non dom specific scripts before doms scripts
	patches.push(`window.logger = ${logger}`);

	// load in the dom scripts
	patches.push(`${recent_fix}`, `${dynamic_css_loader}`);

	// Add a way to track if modules load
	// Very caveman
	patches.unshift(
		`()=>{
			window.sextant = {};
			window.sextant.modules = ${patches.length - 1};
			window.sextant.loaded = 0;
		}`,
	);

	return patches.map((e) => `(${e})()`);
};

export default patch;
