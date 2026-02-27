import { Command } from "commander";
import kleur from "kleur";
import open from "open";

/**
 * Create the 'docs' command
 * Opens the OpenForm documentation in browser
 */
export function createDocsCommand(): Command {
	const docs = new Command("docs");

	docs
		.description("Open OpenForm documentation in browser")
		.action(async () => {
			console.log(kleur.gray("Opening OpenForm documentation..."));
			await open("https://docs.open-form.dev");
		});

	return docs;
}
