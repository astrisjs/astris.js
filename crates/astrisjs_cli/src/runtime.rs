#![allow(dead_code)]

use std::{
    path::{Path, PathBuf},
    process::Command,
};

use which::which;

#[derive(Debug)]
pub struct Runtime {
    pub name: String,
    pub version: String,
    pub executable: PathBuf,
    pub is_bun: bool,
}

impl Runtime {
    pub fn detect() -> Self {
        if Path::new("bun.lockb").exists() || Path::new("bun.lock").exists() {
            return Self::resolve_bun();
        }

        if Path::new("pnpm-lock.yaml").exists() {
            return Self::resolve_node("pnpm");
        }
        if Path::new("yarn.lock").exists() {
            return Self::resolve_node("yarn");
        }
        if Path::new("package-lock.json").exists() {
            return Self::resolve_node("npm");
        }

        if which("bun").is_ok() {
            return Self::resolve_bun();
        } else {
            return Self::resolve_node("npm");
        }
    }

    fn resolve_bun() -> Self {
        let executable = which("bun").unwrap_or_else(|_| PathBuf::from("bun"));
        let version = Self::get_version_output(&executable);

        Self {
            name: "Bun".into(),
            version,
            executable,
            is_bun: true,
        }
    }

    fn resolve_node(manager: &str) -> Self {
        let executable = which("node").unwrap_or_else(|_| PathBuf::from("node"));
        let version = Self::get_version_output(&executable);

        Self {
            name: format!("Node ({})", manager),
            version,
            executable,
            is_bun: false,
        }
    }

    fn get_version_output(cmd_path: &PathBuf) -> String {
        match Command::new(cmd_path).arg("--version").output() {
            Ok(output) if output.status.success() => {
                String::from_utf8_lossy(&output.stdout).trim().to_string()
            }
            _ => "N/A".to_string(),
        }
    }
}
