use bson::oid::ObjectId;
use mongodb::{
	bson::{doc, SerializerOptions},
	options::{FindOneAndUpdateOptions, ReturnDocument},
};
use rocket::{delete, futures::FutureExt, get, http::Status, put, serde::json::Json};

use crate::{
	model::{Friendship, Id, IdResult, User},
	transaction::create_transaction,
};

use super::{
	authorization::AuthResult, users::GetFriendsResponse, AccessToken, AuthError, DBState,
	RequestError,
};

#[get("/users/@me/friends/<userid>")]
pub async fn get_friends(userid: IdResult<User>) -> Result<Json<GetFriendsResponse>, RequestError> {
	let userid = userid?;
	todo!();
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
pub async fn unfriend(userid: IdResult<User>) -> Result<(), RequestError> {
	let userid = userid?;
	todo!();
}
