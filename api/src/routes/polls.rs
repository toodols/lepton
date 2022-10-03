use rocket::{get, serde::json::Json};
use serde::Serialize;

use crate::model::{Poll, IdResult};

use super::GenericRequestError;

#[derive(Serialize)]
pub struct GetPollResponse {
	
}

#[get("/polls/<pollid>")]
pub async fn get_poll(pollid: IdResult<Poll>) -> Result<Json<GetPollResponse>, GenericRequestError> {
	let pollid = pollid?;
	todo!();
}