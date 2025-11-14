dev:
	pnpx @neutralinojs/neu run

dev-d:
	pnpx @neutralinojs/neu run -- --window-enable-inspector

build:
	pnpx @neutralinojs/neu build --release
