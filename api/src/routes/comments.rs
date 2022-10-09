use rocket::{delete, get, serde::json::Json};

use crate::model::{Comment, Id, IdResult, Post};

use super::{DBState, RequestError};

#[get("/<postid>/comments")]
pub fn get_comments(postid: IdResult<Post>) -> Result<Json<()>, RequestError> {
	let postid = postid?;
	todo!();
}

#[get("/<postid>/comments/<commentid>")]
pub fn get_comment_postid(
	db_client: &DBState,
	postid: IdResult<Post>,
	commentid: IdResult<Comment>,
) -> Result<Json<()>, RequestError> {
	get_comment(db_client, commentid)
}

#[get("/comments/<commentid>")]
pub fn get_comment(
	db_client: &DBState,
	commentid: IdResult<Comment>,
) -> Result<Json<()>, RequestError> {
	todo!();
}
