use serde::Serialize;

use crate::gateway::packet::GatewayPacketData;

#[derive(Serialize)]
pub struct HeartbeatPacketData(Option<u64>);

impl GatewayPacketData for HeartbeatPacketData {
    fn opcode(&self) -> u8 {
        1
    }
}

impl HeartbeatPacketData {
    pub fn new(n: Option<u64>) -> Self {
        Self(n)
    }
}
