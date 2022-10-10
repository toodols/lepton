use rocket::{put, serde::json::Json};

use crate::model::Settings;

use super::{authorization::AuthResult, RequestError, DBState};

#[put("/@me/settings", data="<data>")]
pub async fn update_settings(db_client: &DBState, auth: AuthResult, data: Json<Settings>) -> Result<(), RequestError> {
	let auth = auth?;
	todo!();
}