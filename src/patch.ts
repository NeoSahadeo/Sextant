import auto_login from "./patches/auto_login";
import stream from "./patches/stream";

const patch = () => {
	const patches = [`${stream}`];
	return patches.map((e) => `(${e})()`);
};

export default patch;
