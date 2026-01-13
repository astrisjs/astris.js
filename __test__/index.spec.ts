import { describe, expect, test } from "bun:test";
import { BotEngine } from "../index";

function waitMessage(bot: BotEngine): Promise<string> {
	return new Promise((resolve, reject) => {
		bot.connect((err, msg) => {
			if (err) return reject(err);
			resolve(msg);
		});
	});
}

describe("AstrisJS Core", () => {
	test("deve conectar e receber mensagem do Rust", async () => {
		const bot = new BotEngine("TestBot");

		console.log("Aguardando mensagem do Rust...");

		const message = await waitMessage(bot);

		expect(message).toBeDefined();
		expect(message).toContain("TestBot");
		expect(message).toContain("Mensagem");
	});
});
