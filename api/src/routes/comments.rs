use std::collections::{HashMap, HashSet};

use mongodb::bson::doc;
use rocket::{get, serde::json::Json};
use serde::Serialize;

use crate::{
	model::{Comment, Group, GroupPrivacy, IdResult, Post, SerializingPartialUser, Id, User},
	routes::cursor::{CursorToVecResult, CursorUtils},
};

use super::{authorization::AuthResult, DBState, RequestError};

#[derive(Serialize)]
pub struct GetCommentResult {
	users: HashMap<Id<User>, SerializingPartialUser>,
	comments: Vec<Comment>,
	has_more: bool,
}

/// Gets a list of comments with for a given post with an optional limit (num) and before (timestamp)
/// Limit defaults to and is constrained to 50
/// If the post is part of a private group, the user must be also member of that group
/// Since this does not modify anything, any data race problems are temporary and don't matter
#[get("/<postid>/comments?<before>&<limit>")]
pub async fn get_comments(
	db_client: &DBState,
	postid: IdResult<Post>,
	limit: Option<usize>,
	before: Option<i64>,
	auth: AuthResult,
) -> Result<Json<GetCommentResult>, RequestError> {
	let postid = postid?;
	let post: Post = db_client
		.posts
		.find_one(postid.into_query(), None)
		.await?
		.ok_or_else(|| {
			RequestError::not_found(format!("Can't find post with id {}", postid.to_string()))
		})?;
	match post.group {
		Some(group) => {
			let group: Group = db_client
				.groups
				.find_one(group.into_query(), None)
				.await?
				.ok_or_else(|| {
					RequestError::not_found("Post is part of a group but cannot find group")
				})?;
			if group.privacy != GroupPrivacy::Public {
				db_client
					.group_users
					.find_one(
						doc! {
							"group": group.id,
							"user": auth?.user,
						},
						None,
					)
					.await
					.map_err(|_| RequestError::forbidden("User is not a member of the group"))?;
			}
		}
		None => {}
	}
	const LIMIT: usize = 50;
	let comments;
	let has_more;
	CursorToVecResult::<Comment> {data: comments, has_more} = db_client
		.comments
		.find(postid.into_query(), None)
		.await?
		.to_vec(limit.and_then(|num| Some(num.max(LIMIT))).unwrap_or(LIMIT))
		.await?;
	
	// userids without duplicates
	let userids = comments
		.iter()
		.map(|comment| comment.author)
		.collect::<HashSet<_>>().into_iter().collect::<Vec<_>>();

	let mut users = HashMap::with_capacity(userids.len());
	let mut cursor = db_client.users.find(doc!{
		"_id": {
			"$in": userids
		}
	}, None).await?;
	while cursor.advance().await? {
		let user = cursor.deserialize_current()?;
		users.insert(user.id, user.into());
	}
	Ok(Json(GetCommentResult { users, comments, has_more }))
	
}

// /comments and /<postid>/comments are both fine because /comments represents *all* comments while /<postid>/comments represents comments for a specific post
// #[get("/<postid>/comments/<commentid>")]
// pub fn get_comment_postid(
// 	db_client: &DBState,
// 	postid: IdResult<Post>,
// 	commentid: IdResult<Comment>,
// ) -> Result<Json<()>, RequestError> {
// 	get_comment(db_client, commentid)
// }

#[get("/comments/<commentid>")]
pub async fn get_comment(
	db_client: &DBState,
	commentid: IdResult<Comment>,
) -> Result<Json<Comment>, RequestError> {
	let commentid = commentid?;
	let comment: Comment = db_client
		.comments
		.find_one(commentid.into_query(), None)
		.await?
		.ok_or_else(|| {
			RequestError::not_found(format!(
				"Can't find comment with id {}",
				commentid.to_string()
			))
		})?;
	Ok(Json(comment))
}
