use serde::{Deserialize, Serialize};
use serde_json::Value;

pub mod heartbeat;
pub mod hello;
pub mod identify;

pub trait GatewayPacketData {
    fn opcode(&self) -> u8;
}

#[derive(Serialize)]
pub struct GatewayPacket<T> {
    pub op: u8,
    pub d: T,
}

impl<T: GatewayPacketData> GatewayPacket<T> {
    pub fn from(d: T) -> Self {
        Self { op: d.opcode(), d }
    }
}

#[derive(Deserialize, Debug)]
pub struct IncomingPacket {
    pub op: u8,
    #[serde(default)]
    pub t: Option<String>,
    #[serde(default)]
    pub s: Option<u64>,
    pub d: Option<Value>,
}
