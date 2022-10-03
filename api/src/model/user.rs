use bitflags::bitflags;
use serde::{Deserialize, Serialize};

use super::{Id, Group, Friendship, CollectionItem, InventoryItem};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
	avatar: String,
	description: String,
	theme: String,
	banner: String,
	accent_color: String,
}

impl Default for Settings {
	fn default() -> Self {
		Self {
			avatar: "/avatar.png".to_string(),
			description: String::new(),
			theme: "default".to_string(),
			banner: "".to_string(),
			accent_color: "#ff0000".to_string(),
		}
	}
}

// lmfao straight from photop
bitflags! {
	pub struct Flags: u32 {
		const NONE = 0;
		const OWNER = 1 << 0;
		const DEVELOPER = 1 << 1;
		const MODERATOR = 1 << 2;
		const ADMIN = 1 << 3;
		const TESTER = 1 << 4;
		const CONTRIBUTOR = 1 << 5;
		const VERIFIED = 1 << 6;
	}
}
impl Flags {
	pub fn can_delete_posts(self) -> bool {
		let can_delete_posts = Flags::ADMIN & Flags::DEVELOPER & Flags::OWNER & Flags::MODERATOR;
		self.intersects(can_delete_posts)
	}
}
impl<'de> Deserialize<'de> for Flags {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let value = u32::deserialize(deserializer)?;
		Ok(Flags::from_bits_truncate(value))
	}
}

impl Serialize for Flags {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer,
	{
		serializer.serialize_u32(self.bits())
	}
}

#[test]
fn de_bitflags() {
	let s = "5";
	let flags: Flags = serde_json::from_str(s).unwrap();
	assert_eq!(flags, Flags::MODERATOR | Flags::OWNER);
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct User {
	#[serde(rename = "_id")]
	pub id: Id<User>,
	// #[serde(with = "chrono::serde::ts_milliseconds")]
	// pub updated_at: DateTime<Utc>,
	pub username: String,
	pub settings: Settings,
	pub money: u32,
	pub flags: Flags,
	pub blocked: Vec<Id<User>>,
	pub inventory: Vec<InventoryItem>,
}


impl CollectionItem for User {
	fn collection_name() -> &'static str {
		"users"
	}
}


// // This would have been really nice...
// impl<T: Serialize> From<T> for Bson {
// 	fn from(value: T) -> Self {
// 		bson::to_bson(&value).unwrap()
// 	}
// }

impl Default for User {
	fn default() -> Self {
		Self {
			id: Id::new(),
			username: String::new(),
			settings: Settings::default(),
			inventory: Vec::new(),
			money: 0,
			flags: Flags::NONE,
			blocked: Vec::new(),
		}
	}
}

impl User {
	pub fn new(username: String) -> Self {
		Self {
			username,
			..Default::default()
		}
	}
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SerializingUser {
	pub id: Id<User>,
	pub username: String,
	pub avatar: String,
	pub description: String,
	pub banner: String,
	pub following_count: u64,
	pub follower_count: u64,
	pub friends: Vec<Id<User>>,
	pub flags: Flags,
	// #[serde(with = "chrono::serde::ts_milliseconds")]
	// pub updated_at: DateTime<Utc>,
	pub inventory: Vec<InventoryItem>,
}

impl SerializingUser {
	pub fn from_user(
		user: User,
		following_count: u64,
		follower_count: u64,
		friends: Vec<Id<User>>,
	) -> Self {
		Self {
			id: user.id,
			username: user.username,
			avatar: user.settings.avatar,
			description: user.settings.description,
			banner: user.settings.banner,
			following_count,
			follower_count,
			friends,
			flags: user.flags,
			inventory: user.inventory,
		}
	}
}

#[derive(Serialize, Clone)]
#[serde(rename_all="camelCase")]
pub struct ClientInfo {
	pub groups: Vec<Id<Group>>,
	pub settings: Settings,
	pub blocked: Vec<Id<User>>,
	pub outgoing_friend_requests: Vec<Id<Friendship>>,
	pub incoming_friend_requests: Vec<Id<Friendship>>
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SerializingPartialUser {
	pub id: Id<User>,
	pub username: String,
	pub avatar: String,
	pub flags: Flags,
}

impl From<User> for SerializingPartialUser {
	fn from(user: User) -> Self {
		Self {
			id: user.id,
			username: user.username,
			avatar: user.settings.avatar,
			flags: user.flags,
		}
	}
}
