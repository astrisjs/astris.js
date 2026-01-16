use futures_util::{SinkExt, StreamExt};
use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi_derive::napi;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::{
    gateway::{packet::hello::HelloPacketData, GatewayPacket},
    RUNTIME,
};

#[napi]
#[derive(Default)]
pub struct GatewayClient {
    url: String,
}

#[napi]
impl GatewayClient {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            url: "wss://gateway.discord.gg/?v=10&encoding=json".into(),
            ..Default::default()
        }
    }

    #[napi]
    pub fn connect(&self, callback: ThreadsafeFunction<String, ()>) {
        let url = self.url.clone();

        RUNTIME.spawn(async move {
            let (ws_stream, _) = connect_async(url)
                .await
                .expect("Failed to connect to Gateway.");

            let (mut write, mut read) = ws_stream.split();

            let hello_packet = GatewayPacket::from(HelloPacketData::new(45_000));

            let json_payload = serde_json::to_string(&hello_packet).unwrap();
            write.send(Message::text(json_payload)).await.expect("");

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
