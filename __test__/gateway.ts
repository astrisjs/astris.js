const {BotEngine} = require( "../astrisjs.linux-x64-gnu.node");

console.log(BotEngine.prototype)

// const token = Bun.env.DISCORD_TOKEN

// if (!token) throw new Error("Invalid token!")

// const bot = new BotEngine(token)

// bot.login(null, (err, rawEvent) => {
//     if (err) return console.error("Erro Fatal:", err);

//     console.log(rawEvent)
//     const event = JSON.parse(rawEvent);

//     if (event.op === 0) {
//         console.log(`🔥 Evento Recebido: ${event.t}`);
        
//         if (event.t === "READY") {
//             console.log(`Logado como: ${event.d.user.username}`);
//         }
        
//         if (event.t === "MESSAGE_CREATE") {
//             console.log(`💬 Mensagem: ${event.d.content} - de ${event.d.author.username}`);
//         }
//     } else {
//         console.log("Opcode de sistema:", event.op);
//     }
// })

// setInterval(() => {}, 10000);
