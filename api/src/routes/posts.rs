use std::collections::HashMap;

use mongodb::bson::{bson, doc, oid::ObjectId};
use rocket::{get, http::Status, post, serde::json::Json, State};
use serde::{Deserialize, Serialize};

use crate::{
    model::{Comment, Post, User},
};

use super::{DBState, GenericRequestError, AccessToken, AuthError};

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
    before: Option<Json<ObjectId>>,
    user: Option<Json<ObjectId>>,
	auth: Result<AccessToken, AuthError>,
) -> Result<Json<GetPostsResponse>, GenericRequestError> {
	let auth = auth?;
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

    let mut cursor = db_client.posts.find(query, None).await.unwrap();

    const CAPACITY: usize = 30;
    let mut values: Vec<Post> = Vec::with_capacity(CAPACITY);
    let mut has_more = true;
    for _ in 0..CAPACITY {
        if cursor.advance().await.unwrap() {
            values.push(
                cursor
                    .deserialize_current()?
            );
        } else {
            has_more = false;
            break;
        }
    }

    if has_more {
        if !cursor.advance().await.unwrap() {
            has_more = false;
        }
    }

    Ok(Json(GetPostsResponse {
        has_more,
        posts: values,
        comments: vec![],
        users_map: HashMap::new(),
    }))
}
