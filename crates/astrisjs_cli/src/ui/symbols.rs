#![allow(dead_code)]

use core::fmt;

use clap::builder::styling::RgbColor;
use owo_colors::OwoColorize;

use crate::ui::styling::{
    ASTRIS_BLUE, ASTRIS_CYAN, ASTRIS_GREEN, ASTRIS_PINK, ASTRIS_RED, ASTRIS_YELLOW,
};

pub struct Symbol {
    pub icon: &'static str,
    pub color: RgbColor,
}

impl fmt::Display for Symbol {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}",
            self.icon
                .truecolor(self.color.0, self.color.1, self.color.2)
                .bold()
        )
    }
}

pub const SUCCESS: Symbol = Symbol {
    icon: "✔",
    color: ASTRIS_GREEN,
};

pub const ERROR: Symbol = Symbol {
    icon: "✖",
    color: ASTRIS_RED,
};

pub const WARN: Symbol = Symbol {
    icon: "⚠",
    color: ASTRIS_YELLOW,
};

pub const INFO: Symbol = Symbol {
    icon: "ℹ",
    color: ASTRIS_BLUE,
};

pub const STEP: Symbol = Symbol {
    icon: "►",
    color: ASTRIS_PINK,
};

pub const ITEM: Symbol = Symbol {
    icon: "›",
    color: ASTRIS_CYAN,
};

pub const STAR: Symbol = Symbol {
    icon: "★",
    color: ASTRIS_CYAN,
};
