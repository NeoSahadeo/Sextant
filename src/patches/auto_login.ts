import { ipcMain } from "electron";

const auto_login_handler = (data?: any) => {
	console.log("Loaded Auto Login");
	ipcMain.handle("auto_login", async () => {
		return {
			email: data.credentials.email,
			password: data.credentials.password,
		};
	});
};

const get_inputs = () => {
	const email_element: HTMLInputElement | null =
		document.querySelector(`[type="text"]`);
	const password_element: HTMLInputElement = document.querySelector(
		`[type="password"]`,
	) as HTMLInputElement;

	return { email_element, password_element };
};

export default async () => {
	const auth_box = document.querySelector("[class^=authBox]");
	if (auth_box !== null) {
		// Log in here!
		const { email, password } = await (window as any).electron.auto_login();

		const login_button: HTMLButtonElement | null = document.querySelector(
			'[class^="centeringWrapper"] [class^="button"]',
		);
		if (login_button !== null) {
			login_button.click();
		}

		const recheck = setInterval(() => {
			const email_element: HTMLInputElement | null =
				document.querySelector(`[type="text"]`);
			const password_element: HTMLInputElement = document.querySelector(
				`[type="password"]`,
			) as HTMLInputElement;
			const form_element: HTMLFormElement[] = document.getElementsByTagName(
				"form",
			) as any;
			// const submit_button: HTMLButtonElement = document.querySelector(
			// 	`[type="submit"]`,
			// ) as HTMLButtonElement;

			if (email_element === null) {
				console.error("Email seems to be missing, waiting for a bit");
				return;
			}

			// const email_element_clone = email_element.cloneNode(true);
			// email_element.replaceWith(email_element_clone);
			//
			// const password_element_clone = password_element.cloneNode(true);
			// password_element.replaceWith(password_element_clone);
			//
			// setInterval(() => {
			// 	(document.getElementsByTagName("html") as any)[0].classList =
			// 		"mouse-mode app-focused platform-web theme-dark theme-darker images-dark density-default font-size-16 has-webkit-scrollbar full-motion visual-refresh";
			// }, 10);
			// setTimeout(() => {
			// 	(email_element as any).value = email;
			// 	(password_element as any).value = password;
			// }, 1000);
			//
			// setTimeout(() => form_element[0].submit(), 1000);

			// const events_to_remove = [
			// 	"keydown",
			// 	"keyup",
			// 	"keypress",
			// 	"focus",
			// 	"blur",
			// 	"click",
			// 	"mouseup",
			// 	"mousedown",
			// 	"mouseenter",
			// 	"mouseexit",
			// 	"hover",
			// ];
			// events_to_remove.forEach((e) => {
			// 	root.removeEventListener(e, () => { });
			// });

			// events_to_remove.forEach((e) => {
			// 	email_element.removeEventListener(e, () => { });
			// });

			clearInterval(recheck);
		}, 500);
	}
};

export { auto_login_handler };
