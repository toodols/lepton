use futures::FutureExt;
use mongodb::bson::{doc, oid::ObjectId, DateTime};
use rocket::{delete, get, http::Status, post, serde::json::Json};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap};

use crate::{
	model::{Comment, Group, GroupPrivacy, GroupUser, Id, IdResult, Post, User},
	routes::cursor::CursorToVecResult,
	transaction::create_transaction, unbson::Unbson,
};

use super::{authorization::AuthResult, cursor::CursorUtils};
use super::{DBState, RequestError};

// TODO: edit post

#[derive(Deserialize)]
pub struct NewPost {
	content: String,
	// TODO: attachments
}

#[post("/posts?<groupid>", data = "<data>")]
pub async fn create_post(
	db_client: &DBState,
	data: Json<NewPost>,
	auth: AuthResult,
	groupid: Option<Id<Group>>,
) -> Result<Json<Id<Post>>, RequestError> {
	let auth = auth?;
	Ok(create_transaction(db_client.client.clone(), |transaction| {
		async move {
			let groupid = match groupid {
				Some(groupid) => {
					let group = transaction.get(groupid).await?.ok_or_else(|| {
						RequestError(Status::NotFound, "Group not found".to_string())
					})?;
					if group.privacy == GroupPrivacy::Private {
						let group_user: Option<GroupUser> = transaction
							.find_one(
								doc! {
									"user": auth.user,
									"group": groupid,
								},
								None,
							)
							.await?;
						if group_user.is_none() {
							return Err(RequestError(
								Status::Forbidden,
								"You are not a member of this group".to_string(),
							));
						};
					}
					Some(groupid)
				}
				None => None,
			};
			let Json(NewPost { content, .. }) = data;
			let id = transaction
				.insert(Post::new(content, auth.user, groupid))
				.await?;
			Ok(Json(id))
		}
		.boxed()
	})
	.await?)
}

// #[post("/<groupid>/posts", data = "<data>")]
// pub fn create_post_in_group(
// 	db_client: &DBState,
// 	data: Json<NewPost>,
// 	groupid: Id<Group>,
// ) -> Result<(), RequestError> {
// 	Ok(())
// }

// may be bloated / todo: debloat
#[delete("/posts/<postid>")]
pub async fn delete_post(
	db_client: &DBState,
	postid: IdResult<Post>,
	auth: AuthResult,
) -> Result<(), RequestError> {
	let auth = auth?;
	let postid = postid?;
	let post: Post = db_client
		.posts
		.find_one(postid.into_query(), None)
		.await?
		.ok_or_else(|| {
			RequestError::not_found(format!("Can't find post with id {}", postid.to_string()))
		})?;
	if auth.user != post.author {
		let user: User = db_client
			.users
			.find_one(auth.user.into_query(), None)
			.await?
			.ok_or_else(|| {
				RequestError::not_found(format!("Can't find userid provided in token"))
			})?;
		if !user.flags.can_delete_posts() {
			return Err(RequestError::forbidden(format!(
				"You aren't the author of this post." /* (and also not a moderator) */
			)));
		}
	}

	let delete_res = db_client
		.posts
		.delete_one(postid.into_query(), None)
		.await?;
	if delete_res.deleted_count != 1 {
		Ok(())
	} else {
		Err(RequestError(
			Status::InternalServerError,
			format!("Something failed"),
		))
	}
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
	group: Option<Id<Group>>,
	before: Option<i64>,
	user: Option<Id<User>>,
	auth: AuthResult,
) -> Result<Json<Unbson<GetPostsResponse>>, RequestError> {
	let before = before.map(|before| DateTime::from_millis(before));
	// let auth = auth?;
	let mut query = doc! {};
	if group.is_some() {
		let group: Option<Group> = db_client.groups.find_one(group.unwrap().into_query(), None).await?;
		match group {
			Some(group)=>{
				if group.privacy != GroupPrivacy::Private {
					query.insert("group", group.id);
				} else {
					let group_user: Option<GroupUser> = db_client.group_users.find_one(doc! {
						"user": auth?.user,
						"group": group.id,
					}, None).await?;
					if group_user.is_none() {
						return Err(RequestError::forbidden(format!("You are not a member of this group")));
					}
				}
				query.insert("group", group.id);
			},
			None=>{
				return Err(RequestError::not_found(format!("Group not found")));
			}
		}
			} else {
		query.insert("group", doc! {"$exists": false});
	}
	if before.is_some() {
		query.insert("updatedAt", doc! {"$lt": before.unwrap()});
	}
	if user.is_some() {
		query.insert("author", user.unwrap());
	}

	let cursor = db_client.posts.find(query, None).await.unwrap();

	const CAPACITY: usize = 30;
	let CursorToVecResult::<Post> {
		data: posts,
		has_more,
	} = cursor.to_vec(CAPACITY).await?;

	Ok(Json(Unbson(GetPostsResponse {
		has_more,
		posts,
		comments: vec![],
		users_map: HashMap::new(),
	})))
}
