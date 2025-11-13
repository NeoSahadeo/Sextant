import { os } from "@neutralinojs/lib";

const x = await os.execCommand("python --version");
console.log(`Your Python version: ${x.stdOut}`);

function onWindowClose() {
	Neutralino.app.exit();
}

Neutralino.init();

Neutralino.events.on("windowClose", onWindowClose);
