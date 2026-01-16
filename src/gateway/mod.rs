pub mod client;
pub mod packet;

use serde::Serialize;

use crate::gateway::packet::GatewayPacketData;

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
