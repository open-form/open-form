import { Command } from "commander";
import kleur from "kleur";
import open from "open";

/**
 * Create the 'console' command
 * Opens the OpenForm web console in browser
 */
export function createConsoleCommand(): Command {
	const consoleCmd = new Command("console");

	consoleCmd
		.description("Open OpenForm web console in browser")
		.action(async () => {
			console.log(kleur.gray("Opening OpenForm console..."));
			await open("https://open-form.dev");
		});

	return consoleCmd;
}
