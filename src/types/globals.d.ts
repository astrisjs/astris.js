import type { EnvSchema } from '../utils/env'

declare global {
	var env: EnvSchema

	namespace NodeJS {
		interface ProcessEnv {
			"Use 'env' global variable instead": never
		}
	}

	interface ImportMetaEnv {
		"Use 'env' global variable instead": never
	}
}

declare module 'bun' {
	interface Env {
		"Use 'env' global variable instead": never
	}
}
