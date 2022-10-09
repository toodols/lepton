use rocket::{get, post, serde::json::Json};
use serde::Deserialize;

use crate::model::{IdResult, Trade};

use super::RequestError;

#[derive(Deserialize)]
pub struct CreateTradeData {}

#[post("/trades", data = "<data>")]
pub fn create_trade(data: Json<CreateTradeData>) -> Result<Json<()>, RequestError> {
	todo!()
}

#[get("/trades/<tradeid>")]
pub fn get_trade(tradeid: IdResult<Trade>) -> Result<Json<()>, RequestError> {
	let tradeid = tradeid?;
	todo!();
}
