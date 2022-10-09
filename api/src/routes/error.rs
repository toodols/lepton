use rocket::{
	http::Status,
	response::{self, Responder},
	serde::json::serde_json::json,
	Request, Response,
};

use crate::model::CollectionItem;

use super::AuthError;

#[derive(Debug)]
pub struct RequestError(pub Status, pub String);
impl RequestError {
	pub fn idc() -> Self {
		Self(
			Status::InternalServerError,
			"Some stupid erorr I don't have time to deal iwth.".to_string(),
		)
	}
	pub fn bad_request(msg: &str) -> Self {
		Self(Status::BadRequest, msg.to_string())
	}
	pub fn not_found(msg: impl ToString) -> Self {
		Self(Status::NotFound, msg.to_string())
	}
}

impl<T: CollectionItem> From<Option<T>> for RequestError {
	fn from(option: Option<T>) -> Self {
		Self(Status::NotFound, "Not found".to_string())
	}
}
impl From<mongodb::error::Error> for RequestError {
	fn from(err: mongodb::error::Error) -> Self {
		match err.kind {
			_ => Self(Status::InternalServerError, format!("{:?}", err)),
		}
	}
}
impl From<bson::oid::Error> for RequestError {
	fn from(err: bson::oid::Error) -> Self {
		Self(Status::BadRequest, "Invalid objectID".to_string())
	}
}

impl From<AuthError> for RequestError {
	fn from(err: AuthError) -> Self {
		match err {
			AuthError::MissingTokenHeader => {
				Self(Status::Unauthorized, "Missing 'Bearer'".to_string())
			}
			AuthError::InvalidTokenFormat => {
				Self(Status::Unauthorized, "invalid token format".to_string())
			}
			AuthError::DecodeError(e) => Self(Status::Unauthorized, format!("{:?}", e)),
		}
	}
}

impl<'r> Responder<'r, 'static> for RequestError {
	fn respond_to(self, req: &'r Request<'_>) -> response::Result<'static> {
		let string = json!({
			"error": self.1
		});

		Response::build_from(string.respond_to(req)?)
			.status(self.0)
			.ok()
	}
}
