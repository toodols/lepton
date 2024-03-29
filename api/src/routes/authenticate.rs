use std::env;

use crate::{model::{Auth, Id, Permissions, User, CollectionItem}, unbson::Unbson};
use bson::SerializerOptions;
use crypto::bcrypt::bcrypt;
use mongodb::{
	bson::doc,
	options::{FindOneAndUpdateOptions, ReturnDocument},
	results::InsertOneResult,
};
use rand::Rng;
use rocket::{http::Status, post, serde::json::Json};
use serde::{Deserialize, Serialize};
use tokio::task::spawn_blocking;

use super::{AccessToken, DBState, RequestError};

#[derive(Deserialize)]
pub struct SignInData {
	username: String,
	password: String,
}

#[derive(Serialize)]
pub struct SignInResponse {
	token: String,
}

#[post("/sign-in", data = "<data>")]
pub async fn sign_in(
	db_client: &DBState,
	data: Json<SignInData>,
) -> Result<Json<Unbson<SignInResponse>>, RequestError> {
	let SignInData { username, password } = data.into_inner();

	let auth: Auth = db_client
		.auths
		.find_one(
			doc! {
				"username": username,
				"type": "password",
			},
			None,
		)
		.await
		.unwrap()
		.ok_or_else(|| {
			RequestError(
				Status::NotFound,
				"Can't find document with username".to_owned(),
			)
		})?;
	match auth {
		Auth::Password {
			hashed_password,
			salt,
			user,
			permissions,
			..
		} => {
			let token = jsonwebtoken::encode(
				&jsonwebtoken::Header::default(),
				&AccessToken {
					user,
					permissions,
					exp: chrono::offset::Utc::now(),
				},
				&jsonwebtoken::EncodingKey::from_secret(env::var("JWT_SECRET").unwrap().as_bytes()),
			)
			.unwrap();
			let output: &mut [u8; 24] = &mut [0; 24];
			bcrypt(10, &hex::decode(salt).unwrap(), password.as_bytes(), output);
			if *output == hex::decode(hashed_password).unwrap().as_ref() {
				return Ok(Json(Unbson(SignInResponse { token })));
			} else {
				// unauthorized
				return Err(RequestError(
					Status::Unauthorized,
					"Invalid username or password".to_owned(),
				));
			}
		}
		_ => panic!("Unexpected auth type"),
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
	token: String,
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
		if password.find(|c: char| c.is_numeric()).is_none() {
			Err("Password must contain at least one number")
		} else if password
			.find(|c: char| c.is_alphabetic() && c.is_uppercase())
			.is_none()
		{
			Err("Password must contain at least one uppercase letter")
		} else if password
			.find(|c: char| c.is_alphabetic() && c.is_lowercase())
			.is_none()
		{
			Err("Password must contain at least one lowercase letter")
		} else if password.find(|c: char| !c.is_alphanumeric()).is_none() {
			Err("Password must contain at least one special character")
		} else {
			Ok(())
		}
	}
}

#[post("/sign-up", data = "<data>")]
pub async fn sign_up(
	db_client: &DBState,
	data: Json<SignUpData>,
) -> Result<Json<Unbson<SignUpResponse>>, RequestError> {
	let SignUpData { username, password } = data.into_inner();
	// verify that username is not taken
	let mut cursor = db_client
		.auths
		.find(
			doc! {
				"username": &username,
			},
			None,
		)
		.await
		.unwrap();
	if cursor.advance().await.unwrap() {
		return Err(RequestError(
			Status::BadRequest,
			"Username is already taken".to_owned(),
		));
	}
	// verify that password is secure
	verify_password(&password).map_err(|e| RequestError(Status::BadRequest, e.to_owned()))?;
	let mut output: [u8; 24] = [0; 24];

	// todo: stop using threadrng
	let salt: [u8; 16] = spawn_blocking(|| {
		let mut salt = [0; 16];
		let mut thread = rand::thread_rng();
		thread.fill(&mut salt);
		salt
	})
	.await
	.unwrap();
	bcrypt(10, &salt, password.as_bytes(), &mut output);
	let hashed_password = hex::encode(output);
	let new_user = User::new(username.clone()).to_bson().unwrap();
	let result: Option<User> = db_client
		.users
		.find_one_and_update(
			doc! {
				"username": &username,
			},
			doc! {
				"$setOnInsert": new_user
			},
			FindOneAndUpdateOptions::builder()
				.upsert(true)
				.return_document(ReturnDocument::After)
				.build(),
		)
		.await
		.unwrap();
	let result = result.ok_or_else(|| {
		RequestError(
			Status::InternalServerError,
			"Failed to create user".to_owned(),
		)
	})?;

	let res: InsertOneResult = db_client
		.auths
		.insert_one(
			Auth::Password {
				id: Id::new(),
				username,
				hashed_password,
				salt: hex::encode(salt),
				user: result.id.clone(),
				permissions: Permissions::ALL,
			},
			None,
		)
		.await
		.unwrap();

	let token = jsonwebtoken::encode(
		&jsonwebtoken::Header::default(),
		&AccessToken {
			user: result.id,
			permissions: Permissions::ALL,
			exp: chrono::offset::Utc::now(),
		},
		&jsonwebtoken::EncodingKey::from_secret(env::var("JWT_SECRET").unwrap().as_ref()),
	)
	.unwrap();
	Ok(Json(Unbson(SignUpResponse { token })))
}
