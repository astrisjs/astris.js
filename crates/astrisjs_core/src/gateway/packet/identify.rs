use serde::Serialize;

use crate::gateway::packet::GatewayPacketData;

#[derive(Serialize)]
pub struct IdentifyPacketData {
    token: String,
    intents: u32,
    properties: ConnectionProperties,
}

impl GatewayPacketData for IdentifyPacketData {
    fn opcode(&self) -> u8 {
        2
    }
}

impl IdentifyPacketData {
    pub fn new(token: String, intents: u32, properties: ConnectionProperties) -> Self {
        Self {
            token,
            intents,
            properties,
        }
    }
}

#[derive(Serialize)]
pub struct ConnectionProperties {
    pub os: String,
    pub browser: String,
    pub device: String,
}
impl ConnectionProperties {
    pub fn new(os: String, browser: String, device: String) -> Self {
        Self {
            os,
            browser,
            device,
        }
    }
}
