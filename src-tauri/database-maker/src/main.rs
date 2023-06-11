pub mod kradfile;

use std::{path::PathBuf, str::FromStr};

use anyhow::Result;
use clap::Parser;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};

#[derive(Debug, Parser)]
struct Opt {
  in_dir: PathBuf,
  out_file: PathBuf,
}

#[tokio::main]
async fn main() -> Result<()> {
  let opt = Opt::parse();

  // Open sqlite db
  let uri = format!("sqlite:{}", opt.out_file.display());
  println!("Opening {}...", uri);
  let options = SqliteConnectOptions::from_str(&uri)?.create_if_missing(true);
  let pool = SqlitePoolOptions::new()
    .max_connections(5)
    .connect_with(options)
    .await?;

  // Migrate that shit
  sqlx::migrate!().run(&pool).await?;

  // Kradfile
  kradfile::process_kradfile(&pool, opt.in_dir.join("kradfile.utf8")).await?;

  Ok(())
}
