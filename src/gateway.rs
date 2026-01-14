use serde::Serialize;

#[derive(Serialize)]
pub struct IdentifyPacket {
  pub op: u8,
  pub d: IdentifyData,
}

#[derive(Serialize)]
pub struct IdentifyData {
  pub token: String,
  pub intents: u32,
  pub properties: ConnectionProperties,
}

#[derive(Serialize)]
pub struct ConnectionProperties {
  pub os: String,
  pub browser: String,
  pub device: String,
}
