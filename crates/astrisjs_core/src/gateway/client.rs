use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};

use futures_util::{SinkExt, StreamExt};
use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi_derive::napi;
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::{
    gateway::packet::{
        heartbeat::HeartbeatPacketData,
        hello::HelloPacketData,
        identify::{ConnectionProperties, IdentifyPacketData},
        GatewayPacket, IncomingPacket,
    },
    RUNTIME,
};

#[napi]
#[derive(Default)]
pub struct GatewayClient {
    url: String,
    pub token: String,
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
        let token = self.token.clone();

        RUNTIME.spawn(async move {
            let (ws_stream, _) = connect_async(url)
                .await
                .expect("Failed to connect to Gateway.");

            let (mut write, mut read) = ws_stream.split();

            let (tx, mut rx) = mpsc::channel::<String>(32);

            tokio::spawn(async move {
                while let Some(msg) = rx.recv().await {
                    if let Err(e) = write.send(Message::text(msg)).await {
                        println!("Error sending message on socket: {e}");
                        break;
                    }
                }
            });

            let tx_main = tx.clone();

            let last_sequence = Arc::new(AtomicU64::new(0));
            let last_sequence_read = last_sequence.clone();

            let identify_packet = GatewayPacket::from(IdentifyPacketData::new(
                token,
                32767,
                ConnectionProperties::new("linux".into(), "astrisjs".into(), "astrisjs".into()),
            ));

            let json = serde_json::to_string(&identify_packet).unwrap();
            tx_main.send(json).await.unwrap();

            while let Some(msg) = read.next().await {
                match msg {
                    Ok(Message::Text(text)) => {
                        if let Ok(packet) = serde_json::from_str::<IncomingPacket>(&text) {
                            if let Some(s) = packet.s {
                                last_sequence_read.store(s, Ordering::Relaxed);
                            }

                            match packet.op {
                                10 => {
                                    if let Some(d) = packet.d {
                                        let hello: HelloPacketData =
                                            serde_json::from_value(d).unwrap();
                                        println!(
                                            "✨ Hello! Intervalo: {}ms",
                                            hello.heartbeat_interval
                                        );

                                        let interval = hello.heartbeat_interval;
                                        let tx_heartbeat = tx.clone();
                                        let seq_ref = last_sequence.clone();

                                        tokio::spawn(async move {
                                            tokio::time::sleep(Duration::from_millis(interval))
                                                .await;

                                            let s = seq_ref.load(Ordering::Relaxed);
                                            let s_data = if s == 0 { None } else { Some(s) };

                                            println!(
                                                "💓 Tum-tum (Enviando Heartbeat: {:?})",
                                                s_data
                                            );

                                            let hb_packet = GatewayPacket::from(
                                                HeartbeatPacketData::new(s_data),
                                            );
                                            let json = serde_json::to_string(&hb_packet).unwrap();

                                            if tx_heartbeat.send(json).await.is_err() {
                                                println!("Parando Heartbeat (Canal fechado)");
                                            }
                                        });
                                    }
                                }
                                11 => {
                                    println!("💓 Recebido ACK do Discord (Estamos online!)");
                                }
                                0 => {
                                    callback.call(
                                        Ok(text.to_string()),
                                        ThreadsafeFunctionCallMode::NonBlocking,
                                    );
                                }
                                _ => {}
                            }
                        }
                    }
                    Ok(Message::Close(_)) => break,
                    Err(_) => break,
                    _ => {}
                }
            }
        });
    }
}
