pub mod hello;
pub mod identify;

pub trait GatewayPacketData {
    fn opcode(&self) -> u8;
}
