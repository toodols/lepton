use bitflags::bitflags;
use bson::DateTime;
use mongodb::bson::{oid::ObjectId, Timestamp};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Auth {
    Password {
        #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
        id: Option<ObjectId>,
        username: String,
        /// hex string
        hashed_password: String,
        /// hex string
        salt: String,
        user: ObjectId,
        created_at: DateTime,
        permissions: Permissions,
    },
}

bitflags! {
    #[derive(Serialize, Deserialize)]
    pub struct Permissions: u32 {
        /// Allows the auth to see the user's basic info: username, password
        const INFO = 1 << 0;
        /// Allows the auth to create comments
        const COMMENT = 1 << 1;
        /// Allows the auth to create posts
        const POST = 1 << 2;
        /// Allows the auth to see groups the user is in.
        const VIEW_GROUPS = 1 << 3;
    }
}
