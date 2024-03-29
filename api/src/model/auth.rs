use bitflags::bitflags;
use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, User};

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Auth {
	Password {
		#[serde(rename = "_id")]
		id: Id<Auth>,
		username: String,
		/// hex string
		hashed_password: String,
		/// hex string
		salt: String,
		user: Id<User>,
		// updated_at: DateTime,
		permissions: Permissions,
	},
}

impl CollectionItem for Auth {
	fn db() -> &'static str {
		"auths"
	}
	fn id(&self) -> Id<Self> {
		match self {
			Auth::Password { id, .. } => *id,
		}
	}
}

bitflags! {
	#[derive(Serialize, Deserialize)]
	pub struct Permissions: u32 {
		const ALL = 1 << 0;
		/// Allows the auth to see the user's basic info: username, password
		const INFO = 1 << 1;
		/// Allows the auth to create comments
		const COMMENT = 1 << 2;
		/// Allows the auth to create posts
		const POST = 1 << 3;
		/// Allows the auth to see groups the user is in.
		const VIEW_GROUPS = 1 << 4;
	}
}
