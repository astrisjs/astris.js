use crate::ui::{styling::get_clap_styles, symbols};
use clap::{Parser, Subcommand};

mod runtime;
mod ui;

#[derive(Parser)]
#[command(name = "AstrisJS")]
#[command(about = "A blazingly fast Discord Bot Framework")]
#[command(version)]
#[command(styles = get_clap_styles())]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Start your application")]
    Start,
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Start => {
            println!("{}", ui::banner());
            println!(
                "{} Oops, it looks like you're trying to use a feature in development...",
                symbols::WARN
            );
        }
    }
}
