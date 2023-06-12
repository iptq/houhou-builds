use std::{
  ops::Add,
  path::Path,
  time::{Duration, SystemTime, SystemTimeError, UNIX_EPOCH},
};

use sqlx::{
  database::{HasArguments, HasValueRef},
  encode::IsNull,
  error::BoxDynError,
  Decode, Encode, Sqlite, Type,
};
use tauri::State;

use crate::{
  kanji::KanjiDb,
  srs::{self, SrsDb},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApplicationInfo {
  kanji_db_path: String,
  srs_db_path: String,
}

#[tauri::command]
pub async fn application_info(
  kanji_db: State<'_, KanjiDb>,
  srs_db: State<'_, SrsDb>,
) -> Result<ApplicationInfo, String> {
  Ok(ApplicationInfo {
    kanji_db_path: kanji_db.1.display().to_string(),
    srs_db_path: srs_db.1.display().to_string(),
  })
}

// *****************************************************
// Ticks
// *****************************************************

pub const TICK_MULTIPLIER: i64 = 1_000_000_000;

#[derive(Debug, Clone, Copy)]
pub struct Ticks(pub i64);

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EpochMs(pub u64);

impl Ticks {
  pub fn now() -> Result<Self, SystemTimeError> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.into())
  }

  #[inline]
  pub fn epoch_ms(&self) -> EpochMs {
    let millis = Duration::from_nanos(self.0 as u64).as_millis() as u64;
    EpochMs(millis)
  }
}

impl Into<Duration> for Ticks {
  fn into(self) -> Duration {
    Duration::from_nanos(self.0 as u64)
  }
}

impl From<Duration> for Ticks {
  fn from(value: Duration) -> Self {
    Ticks(value.as_secs() as i64 * TICK_MULTIPLIER)
  }
}

impl<'q> Encode<'q, Sqlite> for Ticks {
  fn encode_by_ref(
    &self,
    buf: &mut <Sqlite as HasArguments<'q>>::ArgumentBuffer,
  ) -> IsNull {
    self.0.encode_by_ref(buf)
  }
}

impl Type<Sqlite> for Ticks {
  fn type_info() -> <Sqlite as sqlx::Database>::TypeInfo {
    i64::type_info()
  }
}

impl Add<Duration> for Ticks {
  type Output = Ticks;

  fn add(self, rhs: Duration) -> Self::Output {
    let rhs_ticks = Ticks::from(rhs);
    Ticks(self.0 + rhs_ticks.0)
  }
}
