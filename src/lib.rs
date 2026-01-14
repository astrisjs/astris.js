use futures_util::{SinkExt, StreamExt};
use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi_derive::napi;
use once_cell::sync::Lazy;
use tokio::runtime::Runtime;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::gateway::{ConnectionProperties, IdentifyData, IdentifyPacket};

mod gateway;

static RUNTIME: Lazy<Runtime> =
  Lazy::new(|| Runtime::new().expect("Unable to initialize an async runtime."));

#[napi]
pub struct BotEngine {
  token: String,
}

#[napi]
impl BotEngine {
  #[napi(constructor)]
  pub fn new(token: String) -> Self {
    BotEngine { token }
  }

  #[napi]
  pub fn connect(&self, callback: ThreadsafeFunction<String, ()>) {
    let token = self.token.clone();

    RUNTIME.spawn(async move {
      let url = "wss://gateway.discord.gg/?v=10&encoding=json";
      let (ws_stream, _) = connect_async(url)
        .await
        .expect("Failed to connect to Gateway.");

      let (mut write, mut read) = ws_stream.split();

      let identify = IdentifyPacket {
        op: 2,
        d: IdentifyData {
          token,
          intents: 32767,
          properties: ConnectionProperties {
            os: "linux".to_string(),
            browser: "astrisjs".to_string(),
            device: "astrisjs".to_string(),
          },
        },
      };

      let json_payload = serde_json::to_string(&identify).unwrap();
      write
        .send(Message::text(json_payload))
        .await
        .expect("Unable to login!");

      while let Some(msg) = read.next().await {
        match msg {
          Ok(Message::Text(text)) => {
            callback.call(
              Ok(text.to_string()),
              ThreadsafeFunctionCallMode::NonBlocking,
            );
          }
          Ok(Message::Close(_)) => {
            callback.call(
              Ok("Conexão fechada pelo Discord".to_string()),
              ThreadsafeFunctionCallMode::Blocking,
            );
            break;
          }
          Err(e) => {
            callback.call(
              Err(napi::Error::from_reason(e.to_string())),
              ThreadsafeFunctionCallMode::Blocking,
            );
            break;
          }
          _ => {}
        }
      }
    });
  }
}
