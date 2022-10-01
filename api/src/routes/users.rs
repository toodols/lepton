use std::str::FromStr;

use bson::{doc, oid::ObjectId};
use rocket::{get, serde::json::Json, http::Status, request::FromRequest};
use serde::{Serialize, Deserialize};

use crate::model::{User, SerializingUser};

use super::{DBState, GenericRequestError, AccessToken};

#[derive(Serialize)]
pub struct GetUserByIdResponse {
	user: SerializingUser
}

#[get("/users/<id>")]
pub async fn get_user(
    db_client: &DBState,
    id: String,
	token: AccessToken,
) -> Result<Json<GetUserByIdResponse>, GenericRequestError> {
	let id = if id == "@me" {
		token.user
	} else {
		ObjectId::from_str(&id)?
	};
    let user: User = db_client
        .users
        .find_one(doc! { "_id": id }, None)
        .await?
        .ok_or(GenericRequestError(Status::NotFound, "User not found".to_string()))?;
    Ok(Json(GetUserByIdResponse { user: SerializingUser::from_user(user, 0, 0, vec![]) }))
}
