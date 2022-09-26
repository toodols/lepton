use super::{DBState, GenericRequestError};
use crate::model::Group;
use rocket::{get, serde::json::Json};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct GetGroupsResponse {
    groups: Vec<Group>,
}

#[get("/groups?<name>")]
pub fn get_groups(
    db_client: &DBState,
    name: String,
) -> Result<Json<GetGroupsResponse>, GenericRequestError> {
    Ok(Json(GetGroupsResponse { groups: vec![] }))
}
