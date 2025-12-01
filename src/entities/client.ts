import { Client, type ClientOptions, GatewayIntentBits } from 'discord.js'

export interface AstrisClientOptions extends Omit<ClientOptions, 'intents'> {
	intents?: ClientOptions['intents']
	paths: {
		commands: string
		events: string
		responders: string
	}
	devGuildId: string | string[]
}

export const createAstrisClient = (options: AstrisClientOptions) => {
	const defaultIntents = [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	]

	const client = new Client({
		...options,
		intents: options.intents ?? defaultIntents,
	})

	console.info('🌌 [Initializing].sky40 [AstrisClient].indigo70...')

	return Object.assign(client, { astrisOptions: options })
}

export const startClient = async (client: Client) => {
	await client.login(env.BOT_TOKEN)
	console.log(
		`✨ [AstrisClient].indigo70 [logged in as].emerald50 [${client.user?.tag}].amber50[!].emerald50`
	)
}
