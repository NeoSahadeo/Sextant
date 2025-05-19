/* NeoSahadeo @ Sextant */
/* Patch for ability to stream */

import { session, desktopCapturer } from "electron";
import { logger } from "../utils";

export default function stream_patch() {
	session.defaultSession.setDisplayMediaRequestHandler(
		async (request, callback) => {
			try {
				const sources = await desktopCapturer.getSources({
					types: ["screen"],
				});

				if (!sources || sources.length === 0) {
					callback(null as any);
					return;
				}

				logger(JSON.stringify(sources), "debug");

				callback({ video: sources[0], audio: "loopback" });
			} catch (error) {
				logger(error, "error");
			}
		},
		{ useSystemPicker: true },
	);
}
