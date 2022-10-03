use rocket::{get, serde::json::Json, delete};

use crate::model::{Post, Id, IdResult, Comment};

use super::{GenericRequestError, DBState};

#[get("/<postid>/comments")]
pub fn get_comments(postid: IdResult<Post>) -> Result<Json<()>, GenericRequestError> {
	let postid = postid?;
	todo!();
}

#[get("/<postid>/comments/<commentid>")]
pub fn get_comment_postid(db_client: &DBState, postid: IdResult<Post>, commentid: IdResult<Comment>) -> Result<Json<()>, GenericRequestError> {
	get_comment(db_client, commentid)
}

#[get("/comments/<commentid>")]
pub fn get_comment(db_client: &DBState, commentid: IdResult<Comment>) -> Result<Json<()>, GenericRequestError> {
	todo!();
}