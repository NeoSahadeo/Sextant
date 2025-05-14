export const better_stream: SextantPlugin = {
	name: "BetterStream",
	load() {
		return () => {
			const getDisplayMedia_old = navigator.mediaDevices.getDisplayMedia;

			// Override the method
			navigator.mediaDevices.getDisplayMedia = async function(constraints) {
				console.log("[Sextant] Applying BetterStream Plugin");

				const stream = await getDisplayMedia_old.apply(this, [constraints]);
				const video_track = stream.getVideoTracks()[0];

				const new_constraints: MediaTrackConstraints = {
					...video_track.getConstraints(),
					height: {
						ideal: 1080,
						exact: 1080,
						max: 1080,
					},
					width: {
						ideal: 1920,
						exact: 1920,
						max: 1920,
					},
					frameRate: {
						exact: 60,
						ideal: 60,
						max: 60,
					},
				};

				console.log("[Sextant] Applying New Constraints", constraints);
				try {
					await video_track.applyConstraints(new_constraints);
					console.log("[Sextant] Constraints applied successfully");
				} catch (err) {
					console.error("[Sextant] Failed to apply constraints:", err);
				}

				return stream;
			};

			const rtcPeerConnection_old = window.RTCPeerConnection;
			class SextantRTCConnection extends rtcPeerConnection_old {
				constructor(...args: any) {
					console.log("[Sextant] Creating PeerConnection with config:", args);
					super(...args);
					console.log("[Sextant] Senders: ", this.getSenders());
					(window as any).local_rtc = this;

					this.addEventListener("negotiationneeded", () => {
						// Check for changes in getSenders()
						const senders = this.getSenders().find(
							(s) => s.track && s.track.kind === "video",
						);
						if (senders) {
							const params = senders.getParameters();
							params.encodings[0].maxBitrate = 2500_000;
							params.encodings[0].maxFramerate = 60;
							params.encodings[0].networkPriority = "high";
							senders.setParameters(params);
							console.log("[Sextant] Senders:", senders);
							console.log("[Sextant] Params:", params);
						}
						// Compare with previous state or handle as needed
					});
				}
			}
			window.RTCPeerConnection = SextantRTCConnection;
		};
	},
};
