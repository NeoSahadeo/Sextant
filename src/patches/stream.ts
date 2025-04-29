export const stream_handler = () => { };

export default async () => {
	class webrtc extends window.RTCPeerConnection {
		constructor() {
			super();
			console.debug("Loaded");
			console.debug(this);
		}
	}

	window.RTCPeerConnection = webrtc as any;
};
