use rocket::{post, serde::json::Json, get};
use serde::Deserialize;

use crate::model::{IdResult, Trade};

use super::GenericRequestError;

#[derive(Deserialize)]
pub struct CreateTradeData {

}

#[post("/trades", data="<data>")]
pub fn create_trade(data: Json<CreateTradeData>) -> Result<Json<()>, GenericRequestError> {
	todo!()
}

#[get("/trades/<tradeid>")]
pub fn get_trade(tradeid: IdResult<Trade>) -> Result<Json<()>, GenericRequestError> {
	let tradeid = tradeid?;
	todo!();
}