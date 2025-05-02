export const stream_handler = () => { };

export default () => {
  const openCamera = async (cameraId: any, minWidth: any, minHeight: any) => {
    const constraints = {
      audio: { echoCancellation: true },
      video: {
        deviceId: cameraId,
        width: { min: minWidth },
        height: { min: minHeight },
      },
    };

    return await navigator.mediaDevices.getUserMedia(constraints);
  };

  const stream_callback = () => {
    const panel = document.querySelector(
      '[class*="content_"] section[class*="panels_"]',
    );
    const stream_bar = document.getElementById(
      "sextant_html_stream",
    ) as HTMLElement;

    if (!stream_bar.innerHTML && panel) {
      stream_bar.innerHTML = `
      <button id="hang_up_btn">
      Hang Up
      </button>
      <button id="toggle_camera">
      Toggle Camera
      </button>
      `;

      const hang_up_btn = document.getElementById("hang_up_btn");
      if (hang_up_btn) {
        hang_up_btn.addEventListener("click", () => {
          let hang_up: any = document.querySelectorAll(
            '[class*="content_"] section[class*="remove"] [class*=flex__]',
          );
          if (hang_up) {
            hang_up = hang_up[1].children[3];
            panel.classList.remove("remove");
            hang_up.click();
            setTimeout(() => {
              stream_bar.style.display = "none";
            }, 0);
          }
        });
      }
      const toggle_camera = document.getElementById("toggle_camera");

      if (toggle_camera) {
        toggle_camera.addEventListener("click", async () => {
          async function getConnectedDevices(type: any) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter((device) => device.kind === type);
          }

          const videoCameras = await getConnectedDevices("videoinput");
          console.log("Cameras found:", videoCameras);
          if (videoCameras && videoCameras.length > 0) {
            // Open first available video camera with a resolution of 1280x720 pixels
            const stream = openCamera(videoCameras[0].deviceId, 1280, 720);
          }
        });
      }
    }

    if (panel && stream_bar.style.display === "none") {
      panel.classList.add("remove");
      stream_bar.style.display = "block";
    }
  };

  const media_panel_observer = new MutationObserver(stream_callback);

  const observer = new MutationObserver(() => {
    const media_panel = document.querySelector(
      '[class*="panels_"] > [class*="wrapper_"]',
    );
    if (media_panel) {
      media_panel_observer.observe(media_panel, {
        subtree: true,
        childList: true,
      });
      const sidebar: HTMLElement = document.querySelector(
        '[class*="base_"] [class*="content_"] [class*="sidebar_"]',
      ) as HTMLElement;
      sidebar.insertAdjacentHTML(
        "beforeend",
        `<div id="sextant_html_stream" style="display: none;"></div>`,
      );

      window.electron.loaded_patch("stream", 1);
      observer.disconnect();
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });

  let _rtc_ref: any = null;

  class _rtc extends RTCPeerConnection {
    constructor(config: RTCConfiguration) {
      super(config);
      _rtc_ref = this;
    }
    close(): void {
      window.logger("Closing!");
      super.close();
    }
  }

  window.RTCPeerConnection = _rtc as any;
};
