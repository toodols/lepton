use std::collections::HashMap;
use bson::DateTime;
use mongodb::bson::{bson, doc, oid::ObjectId};
use rocket::{get, http::Status, post, serde::json::Json, State};
use serde::{Deserialize, Serialize};

use crate::{model::{Comment, Post, User}, routes::cursor::CursorToVecResult};

use super::cursor::CursorUtils;
use super::{AccessToken, AuthError, DBState, GenericRequestError};

#[derive(Deserialize)]
pub struct NewPost {
	content: String,
}

#[post("/posts", data = "<data>")]
pub fn create_post(db_client: &DBState, data: Json<NewPost>) -> Result<(), GenericRequestError> {
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

//todo: include comments
#[get("/posts?<group>&<before>&<user>")]
pub async fn get_posts(
	db_client: &DBState,
	group: Option<Json<ObjectId>>,
	before: Option<Json<DateTime>>,
	user: Option<Json<ObjectId>>,
	auth: Result<AccessToken, AuthError>,
) -> Result<Json<GetPostsResponse>, GenericRequestError> {
	// let auth = auth?;
	let mut query = doc! {};
	if group.is_some() {
		query.insert("group", group.unwrap().into_inner());
	} else {
		query.insert("group", doc! {"$exists": false});
	}
	if before.is_some() {
		query.insert("createdAt", doc! {"$lt": before.unwrap().into_inner()});
	}
	if user.is_some() {
		query.insert("author", user.unwrap().into_inner());
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
