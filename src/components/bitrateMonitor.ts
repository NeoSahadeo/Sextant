/**This is for the bitrate tracking**/
function move_left(
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
	offset: number,
) {
	const temp_canvas = document.createElement("canvas");
	const temp_context = temp_canvas.getContext("2d");
	temp_canvas.width = canvas.width;
	temp_canvas.height = canvas.height;

	temp_context?.drawImage(canvas, 0, 0); // copy the canvas

	context.reset();

	context.drawImage(temp_canvas, -1 * offset, 0);
}
function register_stream_tracker() {
	const current_bitrate = document.getElementById(
		"current_bitrate",
	) as HTMLElement;
	let canvas = document.getElementById(
		"bitrate_display",
	) as HTMLCanvasElement | null;

	if (!canvas) return;

	const context = canvas.getContext("2d");
	if (!context) return;

	const bounds = canvas;
	const center = Math.round(bounds.height / 2);
	const max = 2.5; // 2_500_000bits is  2.5Mbps
	const scale = 0.5;

	const move_delta = 10;
	let delta = 0;
	context.beginPath();
	context.moveTo(0, 0);
	context.reset();
	window.sextant_events.addEventListener("bitrate", (bitrate: number) => {
		current_bitrate.innerText = ` ${bitrate.toFixed(3)}Mbps`;
		context.strokeStyle = "white";

		if (isNaN(bitrate)) bitrate = 0;

		let data_point = bounds.height - bounds.height * (bitrate / max) * scale;
		if (data_point > bounds.height) data_point = bounds.height;
		// console.log("Sextant", data_point, bounds.height);

		context.lineTo(delta, data_point);
		context.stroke();
		delta += move_delta;
		// console.log("Sextant bit", bitrate, data_point, canvas.height);

		if (delta > bounds.width) {
			move_left(canvas, context, move_delta);
			delta -= move_delta;
			context.moveTo(delta - move_delta, data_point);
		}
	});
}
