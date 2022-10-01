// Why. https://github.com/SergioBenitez/Rocket/issues/1234

use std::{env, convert::Infallible};

use bson::oid::ObjectId;
use jsonwebtoken::{Validation, DecodingKey, errors::ErrorKind};
use rocket::{request::{FromRequest, Outcome}, http::Status};
use async_trait::async_trait;
use serde::{Serialize, Deserialize};

use crate::model::{Permissions, Auth};


#[derive(Serialize,Deserialize)]
pub struct AccessToken {
	pub user: ObjectId,
	pub permissions: Permissions,
}

#[derive(Debug)]
pub enum AuthError {
	MissingTokenHeader,
	InvalidTokenFormat,
	DecodeError(ErrorKind)
}

#[async_trait]
impl<'r> FromRequest<'r> for AccessToken {
    type Error = AuthError;

    async fn from_request(request: &'r rocket::Request<'_>) -> rocket::request::Outcome<Self, Self::Error> {
        let token = request.headers().get_one("Authorization")
		.map(|token| token.to_string());
		if token.is_none() {
			return Outcome::Failure((Status::Unauthorized, AuthError::MissingTokenHeader))
		}
		// verify token is in the "Bearer <token>"
		// then get the value of the token
		let token = token.unwrap();
		if !token.starts_with("Bearer ") {
			return Outcome::Failure((Status::Unauthorized, AuthError::InvalidTokenFormat))
		}
		let token = token[7..].to_string();
		// thank you copilot
		let decoded = jsonwebtoken::decode::<AccessToken>(&token, &DecodingKey::from_secret(env::var("JWT_SECRET").unwrap().as_bytes()), &Validation::new(jsonwebtoken::Algorithm::default()));
		match decoded {
			Ok(decoded) => {
				Outcome::Success(decoded.claims)
			},
			Err(err) => {
				return Outcome::Failure((Status::Unauthorized, AuthError::DecodeError(err.into_kind())))
			}
		}
		// .map(rocket::request::Outcome::Success).unwrap_or(rocket::request::Outcome::Failure((rocket::http::Status::Unauthorized, ())));
		// token
    }
}