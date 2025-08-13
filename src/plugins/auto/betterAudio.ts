import { connect } from "node:http2";
import { override_close } from "../../main";

export const better_audio: SextantPlugin = {
  name: "BetterAudio",
  load(config: any) {
    return () => {
      console.log("[Sextant] Running BetterAudio!");

      const gains_hash: Record<string, GainNode> = {};
      const processed_streams = new Set();

      const getUserMedia_old = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = async function(constraints) {
        const stream = await getUserMedia_old.apply(this, [constraints]);
        // console.log("Sextant local id", stream.id);
        processed_streams.add(stream.id);
        return stream;
      };

      const audiocontext_old = window.AudioContext;
      const createMediaStreamSource_old =
        audiocontext_old.prototype.createMediaStreamSource;

      const createGain_old = audiocontext_old.prototype.createGain;

      class SextantAudioContext extends audiocontext_old {
        animate: any = null;
        ended: Boolean = false;
        constructor() {
          super();

          window.sextant_events.addEventListener(
            "better_audio_ontrack",
            async (event: any) => {
              if (processed_streams.has(event.streams[0].id)) return;
              console.log("Sextant", event.streams[0].id);

              processed_streams.add(event.streams[0].id);
              this.ended = false;

              event.streams[0].getAudioTracks().forEach((track: any) => {
                track.addEventListener("ended", () => {
                  processed_streams.delete(event.streams[0].id);
                  delete gains_hash[search];

                  console.log(
                    "[Sextant] BetterAudio: Audio track ended, cleaning up...",
                    track.id,
                  );
                  this.ended = true;
                  // clearInterval(this.animate);
                  // this.animate = null;
                });
              });

              // Create a source node from the incoming MediaStream
              const src = this.createMediaStreamSource(event.streams[0]);

              const analyser = this.createAnalyser();
              src.connect(analyser);

              const data_array = new Uint8Array(analyser.frequencyBinCount);
              const threshold = 0.1; // Adjust threshold for sensitivity

              const search = (event.streams[0].id as string).match(
                /^.+(?=-)/,
              )![0];

              // function limit_loop(fn: () => void, fps: number) {
              //   let then = Date.now();
              //   const interval = 1000 / fps;
              //
              //   function loop() {
              //     requestAnimationFrame(loop);
              //     const now = Date.now();
              //     const delta = now - then;
              //     if (delta > interval) {
              //       then = now - (delta % interval);
              //       fn();
              //     }
              //   }
              //   loop();
              // }

              const check_audio_level = () => {
                analyser.getByteFrequencyData(data_array);
                const average = data_array.reduce((pv, cv, i, a) => pv + cv);

                const element = document.querySelector(
                  `[style*="${search}"]`,
                ) as HTMLElement;
                if (!element) return;

                if (average > threshold * 255) {
                  element.classList.add("sextant_talking");
                } else {
                  element.classList.remove("sextant_talking");
                }
                requestAnimationFrame(check_audio_level);
              };

              // Create a GainNode
              const gain = this.createGain();
              gains_hash[search] = gain;
              gain.gain.value = 0; // Set your desired gain here

              console.log("sextant", gains_hash);
              window.sextant_events.addEventListener(
                "change_gain",
                ({ ...args }: { id: string; value: number }) => {
                  // 1364230616052400240
                  if (gains_hash[args.id] && args.value !== undefined) {
                    console.log(
                      "[Sextant] Changing gain for",
                      args.id,
                      args.value,
                    );
                    gains_hash[args.id].gain.value = args.value;
                  }
                },
              );

              // Connect: source -> gain -> destination
              src.connect(gain);
              gain.connect(this.destination);

              // Attach to a hidden audio element to "kickstart" the stream for Web Audio API
              // Workaround for Chrome bug:
              const dummy_audio = new Audio();
              dummy_audio.srcObject = event.streams[0];
              dummy_audio.muted = true;
              dummy_audio.play().catch(() => { });

              // if (!this.animate) {
              //   this.animate = setInterval(() => {
              //     check_audio_level();
              //   }, 1000);
              // }

              // Usage: limit to 15 fps
              // limit_loop(() => {
              //   check_audio_level();
              // }, 15);
              check_audio_level();
            },
          );
        }
      }

      // @ts-ignore
      SextantAudioContext.prototype.createMediaStreamSource = function(
        media_stream: MediaStream,
      ) {
        const src = createMediaStreamSource_old.call(this, media_stream);
        const connect_original = src.connect;

        src.connect = function(...args: any[]): any {
          // @ts-ignore
          return connect_original.apply(this, args);
        };
        return src;
      };

      // @ts-ignore
      window.webkitAudioContext = SextantAudioContext;
      window.AudioContext = SextantAudioContext;
    };
  },
};
