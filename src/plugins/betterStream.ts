export const better_stream: SextantPlugin = {
	name: "BetterStream",
	load() {
		return () => {
			const getDisplayMedia_old = navigator.mediaDevices.getDisplayMedia;

			// Override the method
			navigator.mediaDevices.getDisplayMedia = async function(constraints) {
				console.log("[Sextant] Applying BetterStream Plugin", constraints);

				const stream = await getDisplayMedia_old.apply(this, [constraints]);

				// for (const track of stream.getTracks()) {
				// 	.addTrack(track, stream);
				// }

				return stream;
			};

			const rtcPeerConnection_old = window.RTCPeerConnection;
			class SextantRTCConnection extends rtcPeerConnection_old {
				constructor(...args: any) {
					console.log("[Sextant] Creating PeerConnection with config:", args);
					super(...args);
				}

				addTrack(track: MediaStreamTrack, ...streams: MediaStream[]) {
					console.log("[Sextant] addTrack called", track);
					console.log("[Sextant] addTrack called", streams);
					const sender = super.addTrack(track, ...streams);

					// Example: Change the maximum video bitrate (in bits per second)
					if (sender.track?.kind === "video") {
						const params = sender.getParameters();
						if (!params.encodings) params.encodings = [{}];
						params.encodings[0].maxBitrate = 10; // 800 kbps
						sender.setParameters(params);
					}

					return sender;
				}
			}
			window.RTCPeerConnection = SextantRTCConnection;
		};
	},
};
