use rocket::{
    http::Status,
    response::{self, Responder},
    serde::json::{serde_json::json},
    Request, Response,
};

use super::AuthError;



#[derive(Debug)]
pub struct GenericRequestError(pub Status, pub String);
impl GenericRequestError {
    pub fn idc() -> Self {
        Self(
            Status::InternalServerError,
            "Some stupid erorr I don't have time to deal iwth.".to_string(),
        )
    }
}
impl From<mongodb::error::Error> for GenericRequestError {
	fn from(err: mongodb::error::Error) -> Self {
		match err.kind {
			_ => todo!()
		}
	}
}
impl From<bson::oid::Error> for GenericRequestError {
	fn from(err: bson::oid::Error) -> Self {
		Self(Status::BadRequest, "Invalid objectID".to_string())
	}
}

impl From<AuthError> for GenericRequestError {
	fn from(err: AuthError) -> Self {
		match err {
			AuthError::MissingTokenHeader => Self(Status::Unauthorized, "Missing 'Bearer'".to_string()),
			AuthError::InvalidTokenFormat => Self(Status::Unauthorized, "invalid token format".to_string()),
			AuthError::DecodeError(_) => Self(Status::Unauthorized, "Decode error".to_string()),
		}
	}
}

impl<'r> Responder<'r, 'static> for GenericRequestError {
    fn respond_to(self, req: &'r Request<'_>) -> response::Result<'static> {
        let string = json!({
            "error": self.1
        });
		
        Response::build_from(string.respond_to(req)?)
            .status(self.0)
            .ok()
    }
}
