use rocket::{get, serde::json::Json};
use serde::Serialize;

use crate::{model::{IdResult, Poll}, unbson::Unbson};

use super::RequestError;

#[derive(Serialize)]
pub struct GetPollResponse {}

#[get("/polls/<pollid>")]
pub async fn get_poll(pollid: IdResult<Poll>) -> Result<Json<Unbson<GetPollResponse>>, RequestError> {
	let pollid = pollid?;
	todo!();
}
