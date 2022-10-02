use std::{str::FromStr, collections::HashMap};

use bson::{doc, oid::ObjectId};
use rocket::{get, http::Status, request::FromRequest, serde::json::Json};
use serde::{Deserialize, Serialize};

use crate::model::{SerializingUser, User, ClientInfo, Group, InventoryItem, Id, Item, Settings};

use super::{AccessToken, AuthError, DBState, GenericRequestError};

#[derive(Serialize)]
pub struct GetUserByIdResponse {
	info: Option<ClientInfo>,
	groups: Option<HashMap<Id<Group>, Group>>,
	items: Option<HashMap<Id<Item>, InventoryItem>>,
	user: SerializingUser,
}

#[get("/users/<id>")]
pub async fn get_user(
	db_client: &DBState,
	id: String,
	auth: Result<AccessToken, AuthError>,
) -> Result<Json<GetUserByIdResponse>, GenericRequestError> {
	let id = if id == "@me" {
		auth?.user
	} else {
		Id::from_str(&id)?
	};
	
	let user: User = db_client
		.users
		.find_one(id.into_query(), None)
		.await?
		.ok_or(GenericRequestError(
			Status::NotFound,
			format!("Can't find user with id {:?}", id),
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
