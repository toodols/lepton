use std::collections::HashMap;

use bson::oid::ObjectId;
use mongodb::{
	bson::{doc},
};
use rocket::{delete, futures::FutureExt, get, http::Status, put, serde::json::Json};
use serde::Serialize;

use crate::{
	model::{Friendship, IdResult, User, Id, SerializingPartialUser},
	transaction::create_transaction,
};

use super::{
	authorization::AuthResult, DBState,
	RequestError,
};

#[derive(Serialize)]
pub struct GetFriendsResponse {
	friends: Vec<Id<User>>,
	users: HashMap<Id<User>, SerializingPartialUser>,
}

// gets list of friendships that are accepted
#[get("/users/@me/friends")]
pub async fn get_friends(db_client: &DBState, auth: AuthResult) -> Result<Json<GetFriendsResponse>, RequestError> {
	let auth = auth?;
	
	let mut userids = Vec::new();
	let mut cursor = db_client
		.friendships
		.find(
			doc! {
				"$or": [
					{
						"from": auth.user,
						"status": "accepted"
					},
					{
						"to": auth.user,
						"status": "accepted"
					}
				]
			},
			None,
		)
		.await?;

	while cursor.advance().await? {
		let friendship: Friendship = cursor.deserialize_current()?;
		if friendship.from == auth.user {
			userids.push(friendship.to);
		} else {
			userids.push(friendship.from);
		}
	}

	let mut users = HashMap::with_capacity(userids.len());
	let mut cursor = db_client
		.users
		.find(
			doc! {
				"_id": {
					"$in": &userids
				}
			},
			None,
		)
		.await?;
	while cursor.advance().await? {
		let user = cursor.deserialize_current()?;
		users.insert(user.id, user.into());
	}
	Ok(Json(GetFriendsResponse {
		friends: userids,
		users,
	}))

}

#[put("/users/@me/friends/<userid>")]
pub async fn befriend(
	db_client: &DBState,
	userid: IdResult<User>,
	auth: AuthResult,
) -> Result<(), RequestError> {
	let userid = userid?;
	let auth = auth?;

	create_transaction::<(), RequestError, _>(db_client.client.clone(), |transaction| {
		async move {
			let user = transaction.get(auth.user).await?.ok_or(RequestError(
				Status::NotFound,
				format!("Can't find user with id {:?}", auth.user),
			))?;
			let target = transaction.get(userid).await?.ok_or(RequestError(
				Status::NotFound,
				format!("Can't find user with id {:?}", auth.user),
			))?;

			let friendship: Option<Friendship> = transaction
				.find_one(
					doc! {
						"$or": [
							{
								"from": ObjectId::from(user.id),
								"to": ObjectId::from(target.id)
							},
							{
								"to": ObjectId::from(user.id),
								"from": ObjectId::from(target.id)
							},
						]
					},
					None,
				)
				.await?;

			match friendship {
				Some(mut friendship) => {
					if friendship.accepted {
						Err(RequestError::bad_request("Already friends"))
					} else {
						if friendship.from == user.id {
							Err(RequestError::bad_request("Already sent a friend request"))
						} else {
							friendship.accepted = true;
							transaction.update(friendship).await?;
							Ok(())
						}
					}
				}
				None => {
					transaction
						.insert(Friendship::new(user.id, target.id))
						.await?;
					Ok(())
				}
			}?;
			Ok(())
		}
		.boxed()
	})
	.await?;
	Ok(())
}

#[delete("/users/@me/friends/<userid>")]
pub async fn unfriend(db_client: &DBState, userid: IdResult<User>, auth: AuthResult) -> Result<(), RequestError> {
	let auth = auth?;
	let userid = userid?;
	db_client.friendships.delete_one(doc!{
		"$or": [
			{
				"from": ObjectId::from(auth.user),
				"to": ObjectId::from(userid),
			},
			{
				"to": ObjectId::from(auth.user),
				"from": ObjectId::from(userid),
			},
		]
	}, None).await?;
	Ok(())
}
