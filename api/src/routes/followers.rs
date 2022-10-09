use rocket::{get, put};

use crate::model::{IdResult, User};

use super::{authorization::AuthResult, RequestError};

#[get("/users/<userid>/followers")]
pub async fn get_followers(userid: IdResult<User>) -> Result<(), RequestError> {
	let userid = userid?;
	todo!();
}

#[put("/users/@me/following/<userid>")]
pub async fn follow(userid: IdResult<User>, auth: AuthResult) -> Result<(), RequestError> {
	let userid = userid?;
	todo!();
}
