use std::path::Path;

use anyhow::Result;
use sqlx::SqlitePool;
use tokio::{
    fs::File,
    io::{AsyncBufReadExt, BufReader},
};

const SEPARATOR: char = ':';

pub async fn process_kradfile(pool: &SqlitePool, path: impl AsRef<Path>) -> Result<()> {
    let file = File::open(path.as_ref()).await?;

    let file_reader = BufReader::new(file);
    let mut lines = file_reader.lines();

    loop {
        let line = match lines.next_line().await? {
            Some(v) => v,
            None => break,
        };

        // Skip comments
        if line.starts_with('#') {
            continue;
        }

        let parts = line.split(SEPARATOR).collect::<Vec<_>>();
        let (kanji, radicals) = match &parts[..] {
            &[kanji, radicals] => {
                let kanji = kanji.trim();
                let radicals = radicals.trim().split_whitespace().collect::<Vec<_>>();
                (kanji, radicals)
            }
            _ => continue,
        };

        println!("kanji: {}, radicals: {:?}", kanji, radicals);
    }

    Ok(())
}
