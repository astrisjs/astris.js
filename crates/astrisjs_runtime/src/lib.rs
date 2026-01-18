pub fn bootstrap() {
    match dotenvy::dotenv() {
        Ok(_) => {},
        Err(err) => {},
    };
}