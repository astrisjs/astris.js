import type { ApplicationCommandData, CommandInteraction } from 'discord.js'
import type { Respondable } from './respondable'

export interface ICommand {
	data: ApplicationCommandData
	execute: (interaction: CommandInteraction) => Promise<Respondable>
}
