import { BotEngine } from './index'

console.log('--- Iniciando Astris.JS ---')

const bot = new BotEngine('AstrisBot')

console.log('JS: Bot instanciado. Conectando ao Gateway...')

bot.connect((error, msg) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }

  console.log(`JS Recebeu evento: ${msg}`)

  if (msg.includes('#5')) console.log('JS: Opa, chegamos na 5º mensagem! O JS ainda está responsivo.')
})

console.log('JS: O script continua rodando, não travamos a main thread!')

setInterval(() => {}, 1000)
