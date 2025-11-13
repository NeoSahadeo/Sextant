let info;

async function demo() {
  info = await Neutralino.os.execCommand("python -m http.server", {
    background: true,
  });
  console.log(`Your Python version: ${info.pid}`);
}

async function onWindowClose() {
  await Neutralino.os.execCommand(`kill -9 ${info.pid}`);
  Neutralino.app.exit();
}

Neutralino.init();

Neutralino.events.on("windowClose", onWindowClose);

demo();
