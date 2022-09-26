use mongodb::bson::{oid::ObjectId, Timestamp};
use serde::{Serialize, Deserialize};
use bitflags::bitflags;

#[derive(Serialize, Deserialize)]
#[serde(tag="type")]
#[serde(rename_all = "camelCase")]
pub enum Auth {
	Password {
		username: String,
		/// hex string
		hashed_password: String,
		/// hex string
		salt: String,
		user: ObjectId,
		created_at: Timestamp,
		permissions: Permissions,
	}
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

		const ALL = Self::INFO.bits | Self::COMMENT.bits | Self::POST.bits | Self::VIEW_GROUPS.bits;
	}
}