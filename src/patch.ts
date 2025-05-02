import { logger } from "./utils";
import auto_login from "./patches/auto_login";
import stream from "./patches/stream";
import dynamic_css_loader from "./patches/dynamic_css_loader";
import reload from "./patches/reload";
import recent_fix from "./patches/recent_fix";

// Amount of patches registered.
export let patch_count = 0;
let dom_patches = 0;

const patch = () => {
	let patches = [];

	// load non dom specific scripts before doms scripts
	patches.push(`window.logger = ${logger}`);

	dom_patches = patches.length;
	// PUT YOUR PATCHES HERE
	// load in the dom scripts
	patches.push(`${stream}`, `${recent_fix}`, `${dynamic_css_loader}`);

	patch_count = patches.length - dom_patches;

	return patches.map((e) => `(${e})()`);
};

export default patch;
