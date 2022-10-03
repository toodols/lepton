use std::{str::FromStr, collections::HashMap};

use bson::{doc, oid::ObjectId};
use rocket::{get, http::Status, request::FromRequest, serde::json::Json, post, put, delete};
use serde::{Deserialize, Serialize};

use crate::model::{SerializingUser, User, ClientInfo, Group, InventoryItem, Id, Item, Settings, IdResult};

use super::{AccessToken, AuthError, DBState, GenericRequestError};

#[derive(Serialize)]
pub struct GetUserByIdResponse {
	info: Option<ClientInfo>,
	groups: Option<HashMap<Id<Group>, Group>>,
	items: Option<HashMap<Id<Item>, InventoryItem>>,
	user: SerializingUser,
}

#[derive(Serialize)]
pub struct GetFriendsResponse {
	friends: Id<User>,
	users: HashMap<Id<User>, SerializingUser>
}

#[get("/users/@me/friends/<userid>")]
pub async fn get_friends(userid: IdResult<User>) -> Result<Json<GetFriendsResponse>, GenericRequestError> {
	let userid = userid?;
	todo!();
}

#[put("/users/@me/friends/<userid>")]
pub async fn befriend(userid: IdResult<User>) -> Result<(), GenericRequestError> {
	let userid = userid?;
	todo!();
}

#[delete("/users/@me/friends/<userid>")]
pub async fn unfriend(userid: IdResult<User>) -> Result<(), GenericRequestError> {
	let userid = userid?;
	todo!();
}

#[get("/users/<userid>/followers")]
pub async fn follow(userid: IdResult<User>) -> Result<(), GenericRequestError> {
	let userid = userid?;
	todo!();
}

#[get("/users/<userid>/followers")]
pub async fn unfollow(userid: IdResult<User>) -> Result<(), GenericRequestError> {
	let userid = userid?;
	todo!();
}


#[get("/users/<userid>")]
pub async fn get_user(
	db_client: &DBState,
	userid: String,
	auth: Result<AccessToken, AuthError>,
) -> Result<Json<GetUserByIdResponse>, GenericRequestError> {
	let userid = if userid == "@me" {
		auth?.user
	} else {
		Id::from_str(&userid)?
	};
	
	let user: User = db_client
		.users
		.find_one(userid.into_query(), None)
		.await?
		.ok_or_else(||GenericRequestError(
			Status::NotFound,
			format!("Can't find user with id {:?}", userid),
		))?;
	let blocked = user.blocked.clone();
	Ok(Json(GetUserByIdResponse {
		user: SerializingUser::from_user(user, 0, 0, vec![]),
		info: Some(ClientInfo {
			groups: Vec::new(),
			settings: Settings::default(),
			blocked,
			outgoing_friend_requests: Vec::new(),
			incoming_friend_requests: Vec::new(),
		}),
		groups: Some(HashMap::new()),
		items: Some(HashMap::new()),
	}))
}
