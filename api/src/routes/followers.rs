use bson::doc;
use rocket::{delete, get, put};

use crate::model::{IdResult, User};

use super::{authorization::AuthResult, DBState, RequestError};

#[get("/users/<userid>/followers")]
pub async fn get_followers(
	db_client: &DBState,
	userid: IdResult<User>,
) -> Result<(), RequestError> {
	let userid = userid?;
	let cursor = db_client
		.follows
		.count_documents(doc! {"to": userid}, None)
		.await?;
	Ok(())
}

#[put("/users/@me/following/<userid>")]
pub async fn follow(userid: IdResult<User>, auth: AuthResult) -> Result<(), RequestError> {
	let userid = userid?;
	todo!();
}

#[delete("/users/@me/following/<userid>")]
pub async fn unfollow(userid: IdResult<User>, auth: AuthResult) -> Result<(), RequestError> {
	let userid = userid?;
	todo!();
}
