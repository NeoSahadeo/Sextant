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

			// Override the getDisplayMedia method
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
						ideal: 30,
						max: 30,
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
				max_bitrate = 8_000_000; //bits
				min_bitrate = Math.floor(this.max_bitrate / 1000);
				scanner: any = null;

				constructor(...args: any) {
					super(...args);
					window.sextant_rtc = this;

					// This is for the better audio plugin
					if ((window as any).sextant_plugin_BetterAudio) {
						this.addEventListener("track", (event) => {
							if (event.track.kind === "audio") {
								console.log("Sextant track id", event.streams[0].id);
								event.preventDefault();
								window.sextant_events.dispatchEvent(
									"better_audio_ontrack",
									event,
								);
								event.stopImmediatePropagation();
							}
						});
					}

					this.addEventListener("negotiationneeded", async () => {
						const transceiver = this.getTransceivers().find(
							(t) => t.sender.track && t.sender.track.kind === "video",
						);
						if (transceiver && vp8.length) {
							console.log("[Sextant] Transceiver: ", transceiver);
							transceiver.setCodecPreferences(vp8);
						}
						const senders = this.getSenders().find(
							(s) => s.track && s.track.kind === "video",
						);
						if (senders) {
							const params = senders.getParameters();
							params.encodings[0].maxBitrate = this.max_bitrate;
							params.encodings[0].networkPriority = "high";
							params.encodings[0].priority = "high";

							console.log("[Sextant] Trying to update encoding parameters");
							try {
								await senders.setParameters(params);
								console.log("[Sextant] Parameters set successfully");
							} catch (e) {
								console.error("[Sextant] Failed to set parameters:", e);
							}

							console.log("Sextant", senders, this.scanner);
							if (this.scanner) clearInterval(this.scanner);

							console.log("[Sextant] Setting Up Scanner");
							let timeout = 0;
							this.scanner = setInterval(async () => {
								const bitrate = await this.calculate_bitrate(senders);

								if (!bitrate) {
									timeout++;
								} else {
									timeout = 0;
								}

								if (timeout === 10) {
									console.log("[Sextant] Max timeout reached, closing scanner");
									timeout = 0;
									clearInterval(this.scanner);
								}

								// console.log("[Sextant] Bitrate", bitrate);
								window.sextant_events.dispatchEvent("bitrate", bitrate);
							}, 250);
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

			// @ts-ignore
			// Munging
			SextantRTCConnection.prototype.createOffer = async function(
				...args
			): Promise<any> {
				// @ts-ignore
				const offer: any = await rtc_create_offer_old.apply(this, args);

				// Munge SDP here
				console.log("[Sextant] Munging Offer");
				let sdp = offer.sdp;
				sdp = sdp.replace(/b=AS:.*\r\n/g, "");
				sdp = sdp.replace(/b=TIAS:.*\r\n/g, "");
				sdp = sdp.replace(
					/(m=video .*\r\n)/,
					`$1b=TIAS:${this.max_bitrate}\r\nb=AS:${this.min_bitrate}\r\n`,
				);
				offer.sdp = sdp;

				return offer;
			};

			window.RTCPeerConnection = SextantRTCConnection;
		};
	},
};
