use serde::Serialize;

use crate::gateway::packet::GatewayPacketData;

#[derive(Serialize)]
pub struct HelloPacketData {
    heartbeat_interval: u64,
}

impl GatewayPacketData for HelloPacketData {
    fn opcode(&self) -> u8 {
        10
    }
}

impl HelloPacketData {
    pub fn new(heartbeat_interval: u64) -> Self {
        Self { heartbeat_interval }
    }
}
