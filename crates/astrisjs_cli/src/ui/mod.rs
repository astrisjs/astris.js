use owo_colors::OwoColorize;

use crate::{
    runtime::Runtime,
    ui::styling::{ASTRIS_PURPLE, AstrisColorize, BUN_COLOR, NODE_COLOR},
};

pub mod styling;
pub mod symbols;

pub fn banner() -> std::string::String {
    let astris_version = env!("CARGO_PKG_VERSION");
    let runtime = Runtime::detect();
    let runtime_name = if runtime.is_bun {
        format!("{}", runtime.name.astris_color(BUN_COLOR))
    } else {
        format!("{}", runtime.name.astris_color(NODE_COLOR))
    };
    let runtime_version = if runtime.is_bun {
        format!("(v{})", runtime.version)
    } else {
        format!("({})", runtime.version)
    };

    format!(
        "{} {} {} - {} {}",
        symbols::STAR,
        "Astris.js".astris_color(ASTRIS_PURPLE).bold(),
        format!("(v{astris_version})").dimmed(),
        runtime_name.bold(),
        runtime_version.dimmed()
    )
}
