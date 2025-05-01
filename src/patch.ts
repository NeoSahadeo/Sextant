import auto_login from "./patches/auto_login";
import stream from "./patches/stream";
import dynamic_css_loader from "./patches/dynamic_css_loader";
import reload from "./patches/reload";
import { logger } from "./utils";

const patch = () => {
	let patches = [];

	// load non dom specific scripts before doms scripts
	patches.push(`window.logger = ${logger}`);

	// load in the dom scripts
	patches.push(`${stream}`, `${dynamic_css_loader}`, `${reload}`);
	return patches.map((e) => `(${e})()`);
};

export default patch;
