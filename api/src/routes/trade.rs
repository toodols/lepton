use rocket::{get, post, serde::json::Json};
use serde::Deserialize;

use crate::model::{IdResult, Trade, InventoryItem};

use super::RequestError;

#[derive(Deserialize)]
pub struct CreateTradeData {
	requesting: InventoryItem
}

#[post("/trades", data = "<data>")]
pub fn create_trade(data: Json<CreateTradeData>) -> Result<(), RequestError> {
	todo!()
}

#[get("/trades/<tradeid>")]
pub fn get_trade(tradeid: IdResult<Trade>) -> Result<(), RequestError> {
	let tradeid = tradeid?;
	todo!();
}
