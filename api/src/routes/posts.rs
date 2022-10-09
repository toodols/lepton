use bson::DateTime;
use mongodb::bson::{bson, doc, oid::ObjectId};
use rocket::{delete, get, http::Status, post, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, str::FromStr};

use crate::{
	model::{Comment, Group, Id, IdResult, Post, User},
	routes::cursor::CursorToVecResult,
};

use super::{authorization::AuthResult, cursor::CursorUtils};
use super::{AccessToken, AuthError, DBState, RequestError};

#[derive(Deserialize)]
pub struct NewPost {
	content: String,
}

#[post("/posts?<group>", data = "<data>")]
pub fn create_post(
	db_client: &DBState,
	data: Json<NewPost>,
	group: Option<Json<Id<Group>>>,
) -> Result<(), RequestError> {
	Ok(())
}

#[derive(Serialize)]
pub struct GetPostsResponse {
	posts: Vec<Post>,
	#[serde(rename = "hasMore")]
	has_more: bool,
	comments: Vec<Comment>,
	#[serde(rename = "usersMap")]
	users_map: HashMap<ObjectId, User>,
}

#[delete("/posts/<postid>")]
pub async fn delete_post(
	db_client: &DBState,
	postid: IdResult<Post>,
	auth: AuthResult,
) -> Result<Json<()>, RequestError> {
	let auth = auth?;
	let postid = postid?;
	let post: Post = db_client
		.posts
		.find_one(postid.into_query(), None)
		.await?
		.ok_or_else(|| {
			RequestError(
				Status::NotFound,
				format!("Can't find post with id {}", postid.to_string()),
			)
		})?;
	if auth.user != post.author {
		let user: User = db_client
			.users
			.find_one(auth.user.into_query(), None)
			.await?
			.ok_or_else(|| {
				RequestError(
					Status::NotFound,
					format!("Can't find userid provided in token"),
				)
			})?;
		if !user.flags.can_delete_posts() {
			return Err(RequestError(
				Status::Unauthorized,
				format!("You aren't the author of this post." /* (and also not a moderator) */),
			));
		}
	}

	let delete_res = db_client
		.posts
		.delete_one(postid.into_query(), None)
		.await?;
	if delete_res.deleted_count != 1 {
		Ok(Json(()))
	} else {
		Err(RequestError(
			Status::InternalServerError,
			format!("Something failed"),
		))
	}
}

//todo: include comments
#[get("/posts?<group>&<before>&<user>")]
pub async fn get_posts(
	db_client: &DBState,
	group: Option<Json<Id<Group>>>,
	before: Option<Json<DateTime>>,
	user: Option<Json<Id<User>>>,
	auth: AuthResult,
) -> Result<Json<GetPostsResponse>, RequestError> {
	// let auth = auth?;
	let mut query = doc! {};
	if group.is_some() {
		query.insert("group", ObjectId::from(group.unwrap().into_inner()));
	} else {
		query.insert("group", doc! {"$exists": false});
	}
	if before.is_some() {
		query.insert("createdAt", doc! {"$lt": before.unwrap().into_inner()});
	}
	if user.is_some() {
		query.insert("author", ObjectId::from(user.unwrap().into_inner()));
	}

	let cursor = db_client.posts.find(query, None).await.unwrap();

	const CAPACITY: usize = 30;
	let CursorToVecResult::<Post> {
		data: posts,
		has_more,
	} = cursor.to_vec(CAPACITY).await?;

	Ok(Json(GetPostsResponse {
		has_more,
		posts,
		comments: vec![],
		users_map: HashMap::new(),
	}))
}
