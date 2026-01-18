use napi::threadsafe_function::ThreadsafeFunction;
use napi_derive::napi;
use once_cell::sync::Lazy;
use tokio::runtime::Runtime;
use tracing::info;

use crate::gateway::client::GatewayClient;

mod gateway;
mod logger;

static RUNTIME: Lazy<Runtime> =
    Lazy::new(|| Runtime::new().expect("Unable to initialize an async runtime."));

#[napi]
pub struct BotEngine {
    token: Option<String>,
    gateway: GatewayClient,
}

#[napi]
impl BotEngine {
    #[napi(constructor)]
    pub fn new(token: Option<String>) -> Self {
        logger::init();

        info!("Initializing AstrisJS");

        Self {
            token,
            gateway: GatewayClient::new(),
        }
    }

    #[napi]
    pub fn login(
        &mut self,
        token: Option<String>,
        callback: ThreadsafeFunction<String, ()>,
    ) -> Result<(), napi::Error> {
        if token.is_none() && self.token.is_none() {
            return Err(napi::Error::from_reason("Token not provided!"));
        }

        if let Some(token) = token {
            self.gateway.token = token;
        }

        if let Some(token) = self.token.clone() {
            self.gateway.token = token;
        }

        self.gateway.connect(callback);

        Ok(())
    }
}
