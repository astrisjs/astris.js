use serde::Deserialize;

use crate::gateway::packet::GatewayPacketData;

#[derive(Deserialize, Debug)]
pub struct HelloPacketData {
    pub heartbeat_interval: u64,
}

impl GatewayPacketData for HelloPacketData {
    fn opcode(&self) -> u8 {
        10
    }
}
