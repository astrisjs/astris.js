import z from 'zod'

const envSchema = z.object({
	BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
})

export type EnvSchema = z.infer<typeof envSchema>

export const loadEnv = () => {
	const runtimeEnv = {
		...process.env,
		...(typeof Bun !== 'undefined' ? Bun.env : {}),
		// @ts-expect-error
		...(typeof Deno !== 'undefined' ? Deno.env : {}),
		...(typeof import.meta.env !== 'undefined' ? import.meta.env : {}),
	}

	const parsed = envSchema.safeParse(runtimeEnv)

	if (!parsed.success) {
		console.error(
			'\n❌ [[AstrisJS]].amber50-b Critical Error of Environment Variables:'
		)
		parsed.error.issues.forEach(issue => {
			console.error(
				`   ➡️  [${issue.path.join('.')}].red-b: ${issue.message}`
			)
		})
		console.error('')
		process.exit(1)
	}

	const envData = Object.freeze(parsed.data)

	globalThis.env = envData
}
