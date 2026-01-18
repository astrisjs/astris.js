use console::{style, Emoji};
use std::{panic, sync::Once};
use tracing_subscriber::{fmt, EnvFilter};

static INIT: Once = Once::new();

pub fn init() {
    INIT.call_once(|| {
        setup_logging();
        setup_panic_hook();
    });
}

fn setup_logging() {
    let format = fmt::format()
        .with_level(true)
        .with_target(false)
        .with_thread_ids(false)
        .with_file(false)
        .with_line_number(false)
        .compact();

    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::fmt()
        .event_format(format)
        .with_env_filter(filter)
        .init();
}

fn setup_panic_hook() {
    panic::set_hook(Box::new(|info| {
        let msg = match info.payload().downcast_ref::<&'static str>() {
            Some(s) => *s,
            None => match info.payload().downcast_ref::<String>() {
                Some(s) => &s[..],
                None => "Erro desconhecido",
            },
        };

        eprintln!(
            "\n{}",
            style("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .red()
                .bold()
        );
        eprintln!(
            "{} {}",
            Emoji("💥", "x"),
            style("ASTRIS CORE CRASHED").red().bold().underlined()
        );
        eprintln!("");
        eprintln!("  {}: {}", style("Reason").bold(), style(msg).white());

        if let Some(location) = info.location() {
            eprintln!(
                "  {}: {}:{}",
                style("Locale").bold(),
                location.file(),
                location.line()
            );
        }

        eprintln!("");
        eprintln!(
            "  {}",
            style("This is probably a bug in the framework.").dim()
        );
        eprintln!("  {}", style("Please report on GitHub.").dim());
        eprintln!(
            "{}",
            style("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .red()
                .bold()
        );
    }));
}
