use std::{thread, time::Duration};

use napi::threadsafe_function::{ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi_derive::napi;

#[napi]
pub struct BotEngine {
  name: String,
}

#[napi]
impl BotEngine {
  #[napi(constructor)]
  pub fn new(name: String) -> Self {
    BotEngine { name }
  }

  #[napi]
  pub fn connect(&self, callback: ThreadsafeFunction<String, ()>) {
    let bot_name = self.name.clone();

    thread::spawn(move || {
      let mut count = 0;

      loop {
        count += 1;

        let fake_message = format!("[{}] Mensagem simulada #{}", bot_name, count);

        if count == 13 {
          callback.call(
            Err(napi::Error::from_reason("Faz o L!!!!")),
            ThreadsafeFunctionCallMode::Blocking,
          );
        }

        callback.call(Ok(fake_message), ThreadsafeFunctionCallMode::Blocking);

        thread::sleep(Duration::from_secs(2));
      }
    });
  }
}
