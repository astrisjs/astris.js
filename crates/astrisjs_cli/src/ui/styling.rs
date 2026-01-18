use clap::builder::styling::{Color, RgbColor, Style};
use owo_colors::{FgDynColorDisplay, OwoColorize};

pub const ASTRIS_CYAN: RgbColor = RgbColor(0, 240, 255);
pub const ASTRIS_PURPLE: RgbColor = RgbColor(189, 0, 255);
pub const ASTRIS_PINK: RgbColor = RgbColor(255, 0, 153);
pub const ASTRIS_BLUE: RgbColor = RgbColor(77, 150, 255);
pub const ASTRIS_GREEN: RgbColor = RgbColor(46, 254, 105);
pub const ASTRIS_YELLOW: RgbColor = RgbColor(242, 255, 0);
pub const ASTRIS_RED: RgbColor = RgbColor(255, 42, 81);
pub const BUN_COLOR: RgbColor = RgbColor(246, 222, 206);
pub const NODE_COLOR: RgbColor = RgbColor(102, 204, 51);

fn to_clap_color(rgb: RgbColor) -> Color {
    Color::Rgb(rgb)
}

pub fn get_clap_styles() -> clap::builder::styling::Styles {
    use clap::builder::styling::Styles;

    Styles::styled()
        .header(
            Style::new()
                .bold()
                .fg_color(Some(to_clap_color(ASTRIS_PURPLE))),
        )
        .literal(
            Style::new()
                .bold()
                .fg_color(Some(to_clap_color(ASTRIS_CYAN))),
        )
        .usage(
            Style::new()
                .bold()
                .fg_color(Some(to_clap_color(ASTRIS_PURPLE))),
        )
        .placeholder(Style::new().fg_color(Some(to_clap_color(ASTRIS_BLUE))))
        .error(
            Style::new()
                .bold()
                .fg_color(Some(to_clap_color(ASTRIS_PINK))),
        )
        .invalid(
            Style::new()
                .bold()
                .fg_color(Some(to_clap_color(ASTRIS_PINK))),
        )
}

#[allow(dead_code)]
pub trait AstrisColorize: OwoColorize {
    fn astris_color(&self, rgb: RgbColor) -> FgDynColorDisplay<'_, owo_colors::Rgb, Self> {
        self.truecolor(rgb.0, rgb.1, rgb.2)
    }
}

impl<T: OwoColorize> AstrisColorize for T {}
