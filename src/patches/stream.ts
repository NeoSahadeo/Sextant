import { session, desktopCapturer } from "electron";

export default function stream_patch() {
	session.defaultSession.setDisplayMediaRequestHandler(
		(request, callback) => {
			desktopCapturer
				.getSources({
					types: ["screen"],
				})
				.then((sources) => {
					callback({ video: sources[0], audio: "loopback" });
				});
		},
		{ useSystemPicker: true },
	);
}
