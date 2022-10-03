use std::{collections::HashMap, str::FromStr};
use bson::DateTime;
use mongodb::bson::{bson, doc, oid::ObjectId};
use rocket::{get, http::Status, post, serde::json::Json, State, delete};
use serde::{Deserialize, Serialize};

use crate::{model::{Comment, Post, User, Id, IdResult, Group}, routes::cursor::CursorToVecResult};

use super::cursor::CursorUtils;
use super::{AccessToken, AuthError, DBState, GenericRequestError};

#[derive(Deserialize)]
pub struct NewPost {
	content: String,
}

#[post("/posts?<group>", data = "<data>")]
pub fn create_post(db_client: &DBState, data: Json<NewPost>, group: Option<Json<Id<Group>>>) -> Result<(), GenericRequestError> {
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
pub async fn delete_post(db_client: &DBState, postid: IdResult<Post>, auth: Result<AccessToken, AuthError>) -> Result<Json<()>, GenericRequestError> {
	let auth = auth?;
	let postid = postid?;
	let post: Post = db_client.posts.find_one(postid.into_query(), None).await?.ok_or_else(||GenericRequestError(Status::NotFound, format!("Can't find post with id {}", postid.to_string())))?;
	if auth.user != post.author {
		let user: User = db_client.users.find_one(auth.user.into_query(), None).await?.ok_or_else(||GenericRequestError(Status::NotFound, format!("Can't find userid provided in token")))?;
		if !user.flags.can_delete_posts() {
			return Err(GenericRequestError(Status::Unauthorized, format!("You aren't the author of this post." /* (and also not a moderator) */)))
		}
	}

	let delete_res = db_client.posts.delete_one(postid.into_query(), None).await?;
	if delete_res.deleted_count != 1 {
		Ok(Json(()))
	} else {
		Err(GenericRequestError(Status::InternalServerError, format!("Something failed")))
	}
}

//todo: include comments
#[get("/posts?<group>&<before>&<user>")]
pub async fn get_posts(
	db_client: &DBState,
	group: Option<Json<Id<Group>>>,
	before: Option<Json<DateTime>>,
	user: Option<Json<Id<User>>>,
	auth: Result<AccessToken, AuthError>,
) -> Result<Json<GetPostsResponse>, GenericRequestError> {
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
	let CursorToVecResult::<Post> { data: posts, has_more } = cursor.to_vec(CAPACITY).await?;

	Ok(Json(GetPostsResponse {
		has_more,
		posts,
		comments: vec![],
		users_map: HashMap::new(),
	}))
}
