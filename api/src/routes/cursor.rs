use async_trait::async_trait;
use mongodb::Cursor;
use rocket::serde::DeserializeOwned;
use serde::{Serialize};

#[derive(Serialize)]
pub struct CursorToVecResult<T> {
	pub data: Vec<T>,
	pub has_more: bool,
}

#[async_trait]
pub trait CursorUtils<T> {
	async fn to_vec(self, limit: usize) -> Result<CursorToVecResult<T>, mongodb::error::Error>;
}

#[async_trait]
impl<'de, T: DeserializeOwned + Send + 'de> CursorUtils<T> for Cursor<T> {
	async fn to_vec(mut self, limit: usize) -> Result<CursorToVecResult<T>,mongodb::error::Error> {
		let mut values: Vec<T> = Vec::with_capacity(limit);
		let mut has_more = true;
		for _ in 0..limit {
			if self.advance().await? {
				values.push(self.deserialize_current()?);
			} else {
				has_more = false;
				break;
			}
		}
	
		if has_more {
			if !self.advance().await? {
				has_more = false;
			}
		}
		Ok(CursorToVecResult {
			data: values,
			has_more,
		})
	}
}