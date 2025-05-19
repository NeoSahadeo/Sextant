import { logger } from "../utils";

export const better_stream: SextantPlugin = {
	name: "BetterStream",
	load(config: any) {
		return () => {
			console.log("[Sextant] Initialising BetterStream");

			const capabilities = RTCRtpSender.getCapabilities("video");
			let vp8: any;
			if (capabilities) {
				const codecs = capabilities.codecs;
				console.log("[Sextant] Available Codes: ", codecs);
				vp8 = codecs.filter((codec) => codec.mimeType === "video/VP8");
			}

			const getDisplayMedia_old = navigator.mediaDevices.getDisplayMedia;

			// Override the method
			navigator.mediaDevices.getDisplayMedia = async function(constraints) {
				console.log("[Sextant] Applying BetterStream Plugin");

				const stream = await getDisplayMedia_old.apply(this, [constraints]);
				const video_track = stream.getVideoTracks()[0];

				const custom_constraints: MediaTrackConstraints = {
					width: {
						ideal: 1920,
						max: 1920,
					},
					height: {
						ideal: 1080,
						max: 1080,
					},
					frameRate: {
						ideal: 24,
						max: 24,
					},
				};

				console.log("[Sextant] Trying to apply custom contraints", constraints);
				try {
					await video_track.applyConstraints(custom_constraints);
					console.log("[Sextant] Constraints applied successfully");
				} catch (err) {
					console.error("[Sextant] Failed to apply constraints:", err);
				}

				return stream;
			};

			const rtc_peer_connection_old = window.RTCPeerConnection;
			const rtc_create_offer_old =
				rtc_peer_connection_old.prototype.createOffer;

			class SextantRTCConnection extends rtc_peer_connection_old {
				last_bytes_sent = 0;
				last_timestamp = 0;

				constructor(...args: any) {
					super(...args);
					(window as any).local_rtc = this;

					this.addEventListener("negotiationneeded", async () => {
						let scanner: any = null;
						const senders = this.getSenders().find(
							(s) => s.track && s.track.kind === "video",
						);
						if (senders) {
							const params = senders.getParameters();
							params.encodings[0].maxBitrate = 1_000_000;
							params.encodings[0].networkPriority = "high";
							params.encodings[0].priority = "high";

							console.log("[Sextant] Trying to update encoding parameters");
							try {
								await senders.setParameters(params);
								console.log("[Sextant] Parameters set successfully");
							} catch (e) {
								console.error("[Sextant] Failed to set parameters:", e);
							}
							if (scanner) {
								clearInterval(scanner);
							}

							console.log("[Sextant] Setting Up Scanner");
							let timeout = 0;
							scanner = setInterval(async () => {
								const bitrate = await this.calculate_bitrate(senders);
								if (!bitrate) {
									timeout++;
								} else {
									timeout = 0;
								}
								if (timeout === 10) {
									console.log("[Sextant] Max timeout reached, closing scanner");
									timeout = 0;
									clearInterval(scanner);
								}

								window.sextant_events.dispatchEvent("bitrate", bitrate);
							}, 250);
						}
						const transceiver = this.getTransceivers().find(
							(t) => t.sender.track && t.sender.track.kind === "video",
						);
						if (transceiver && vp8.length) {
							console.log("[Sextant] Transceiver: ", transceiver);
							transceiver.setCodecPreferences(vp8);
						}
					});
				}
				async calculate_bitrate(sender: RTCRtpSender) {
					const stats = await sender.getStats();
					let bitrate = null;
					stats.forEach((report) => {
						if (
							report.type === "outbound-rtp" &&
							!report.isRemote &&
							report.kind === "video"
						) {
							const bytes_sent = report.bytesSent;
							const timestamp = report.timestamp; // in ms

							if (this.last_timestamp) {
								const bytes_diff = bytes_sent - this.last_bytes_sent;
								const time_diff = (timestamp - this.last_timestamp) / 1000; // seconds
								bitrate = (bytes_diff * 8) / time_diff / 1_000_000;
							}
							this.last_bytes_sent = bytes_sent;
							this.last_timestamp = timestamp;
						}
					});
					return bitrate;
				}
			}

			//@ts-ignore
			// Munging
			// SextantRTCConnection.prototype.createOffer = function() {
			// 	console.log("[Sextant] RTC Object", this.currentLocalDescription);
			// 	rtc_create_offer_old.call(
			// 		this,
			// 		() => {
			// 			try {
			// 				if (this.currentLocalDescription)
			// 					this.setLocalDescription(this.currentLocalDescription);
			// 				console.log("[Sextant] Setting Local Description Passed");
			// 			} catch {
			// 				console.log("[Sextant] Setting Local Description Failed");
			// 			}
			// 		},
			// 		() => { },
			// 	);
			// };

			window.RTCPeerConnection = SextantRTCConnection;
		};
	},
};
