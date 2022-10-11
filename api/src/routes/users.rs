use std::{collections::HashMap, str::FromStr};

use bson::{doc};

use rocket::{get, http::Status, serde::json::Json};
use serde::{Serialize};

use crate::{model::{
	ClientInfo, Group, Id, InventoryItem, Item, SerializingUser, Settings,
	User,
}, unbson::Unbson};

use super::{authorization::AuthResult, DBState, RequestError};

#[derive(Serialize)]
pub struct GetUserByIdResponse {
	info: Option<ClientInfo>,
	groups: Option<HashMap<Id<Group>, Group>>,
	items: Option<HashMap<Id<Item>, InventoryItem>>,
	user: SerializingUser,
}

#[get("/users/<userid>")]
pub async fn get_user(
	db_client: &DBState,
	userid: String,
	auth: AuthResult,
) -> Result<Json<Unbson<GetUserByIdResponse>>, RequestError> {
	let userid = if userid == "@me" {
		auth?.user
	} else {
		Id::from_str(&userid)?
	};

	let user: User = db_client
		.users
		.find_one(userid.into_query(), None)
		.await?
		.ok_or_else(|| {
			RequestError(
				Status::NotFound,
				format!("Can't find user with id {:?}", userid),
			)
		})?;
	let blocked = user.blocked.clone();
	Ok(Json(Unbson(GetUserByIdResponse {
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
	})))
}
