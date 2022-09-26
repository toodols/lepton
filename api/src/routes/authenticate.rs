use crypto::bcrypt::bcrypt;
use mongodb::{bson::{doc, oid::ObjectId}, options::FindOneAndUpdateOptions};
use rand::Rng;
use rocket::{post, serde::json::Json, http::Status};
use serde::{Deserialize, Serialize};
use lazy_static::lazy_static;
use tokio::task::spawn_blocking;
use crate::model::{Auth, Permissions, User};

use super::{DBState, GenericRequestError};

#[derive(Deserialize)]
pub struct SignInData {
	username: String,
	password: String,
}

#[derive(Serialize)]
pub struct SignInResponse {
	token: String,
}

#[derive(Serialize, Deserialize)]
struct JWTClaims {
	user: ObjectId,
	permissions: Permissions
}

#[post("/sign-in", data="<data>")]
pub async fn sign_in(db_client: &DBState, data: Json<SignInData>) -> Result<Json<SignInResponse>, GenericRequestError> {
	let SignInData {username, password} = data.into_inner();

	let mut cursor = db_client.auth.find(doc!{
		"username": username,
		"type": "password",
	}, None).await.unwrap();
	if cursor.advance().await.unwrap() {
		let auth = cursor.deserialize_current().unwrap();
		match auth {
			Auth::Password { username: _, hashed_password, salt, user, created_at: _, permissions } => {
				let token = jsonwebtoken::encode(&jsonwebtoken::Header::default(), &JWTClaims {
					user,
					permissions
				}, &jsonwebtoken::EncodingKey::from_secret("secret".as_ref())).unwrap();
				let output: &mut [u8] = &mut [];
				bcrypt(2, &hex::decode(salt).unwrap(), password.as_bytes(), output);
				if output == hex::decode(hashed_password).unwrap() {
					return Ok(Json(SignInResponse { token }));
				} else {
					// unauthorized
					return Err(GenericRequestError(Status::Unauthorized, "Invalid username or password".to_owned()));
				}

			},
			_ => panic!("Unexpected auth type")
		}
	} else {
		Err(GenericRequestError(Status::NotFound, "Can't find document with username".to_owned()))
	}
}


#[derive(Deserialize)]
pub struct SignUpData {
	username: String,
	password: String,
	// might include other fields like email
}

#[derive(Serialize)]
pub struct SignUpResponse {
	
}

pub fn verify_password(password: impl AsRef<str>) -> Result<(), &'static str> {
	let password = password.as_ref();
	let len = password.len();
	if len < 8 {
		return Err("Password must be at least 8 characters long");
	}
	if len > 32 {
		return Err("Password must be at most 32 characters long");
	}
	if len > 16 {
		// Passwords that are longer than 16 characters are secure enough that they do not need to fit the other requirements
		Ok(())
	} else {
		if password.find(|c: char|c.is_numeric()).is_none() {
			Err("Password must contain at least one number")
		} else if password.find(|c: char|c.is_alphabetic() && c.is_uppercase()).is_none() {
			Err("Password must contain at least one uppercase letter")
		} else if password.find(|c: char|c.is_alphabetic() && c.is_lowercase()).is_none() {
			Err("Password must contain at least one lowercase letter")
		} else if password.find(|c: char|!c.is_alphanumeric()).is_none() {
			Err("Password must contain at least one special character")
		} else {
			Ok(())
		}
	}
}

#[post("/sign-up", data="<data>")]
async fn sign_up(db_client: &DBState, data: Json<SignUpData>) -> Result<Json<SignUpResponse>, GenericRequestError> {
	let SignUpData {username, password} = data.into_inner();
	// verify that username is not taken
	let mut cursor = db_client.auth.find(doc!{
		"username": &username,
	}, None).await.unwrap();
	if cursor.advance().await.unwrap() {
		return Err(GenericRequestError(Status::BadRequest, "Username is already taken".to_owned()));
	}
	// verify that password is secure
	verify_password(&password).map_err(|e|GenericRequestError(Status::BadRequest, e.to_owned()))?;
	let mut output: [u8; 32] = [0; 32];

	// todo: stop using threadrng
	let salt = spawn_blocking(||{
		let mut salt: [u8; 16] = [0; 16];
		let mut thread = rand::thread_rng();
		thread.fill(&mut salt);
		salt
	}).await.unwrap();
	
	bcrypt(2, &salt, password.as_bytes(), &mut output);
	let hashed_password = hex::encode(output);
	let new_user = bson::to_bson(&User::new(username.clone())).unwrap();
	let mut result: Option<Auth> = db_client.auth.find_one_and_update(doc!{
		"username": username,
	}, doc!{
		"$set": new_user
	}, FindOneAndUpdateOptions::builder().build()).await.unwrap();
	

	todo!();
}