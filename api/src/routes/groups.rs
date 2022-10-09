use super::cursor::CursorUtils;
use super::{cursor::CursorToVecResult, DBState, RequestError};
use crate::model::Group;
use bson::doc;
use rocket::{get, serde::json::Json};

#[get("/groups?<name>")]
pub async fn get_groups(
	db_client: &DBState,
	name: String,
) -> Result<Json<CursorToVecResult<Group>>, RequestError> {
	let cursor = db_client
		.groups
		.find(doc! {"name": {"$regex": name, "$options": "i"}}, None)
		.await
		.unwrap();
	let amount = 10;
	Ok(Json(cursor.to_vec(amount).await?))
}
