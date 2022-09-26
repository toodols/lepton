use mongodb::bson::{oid::ObjectId, Bson};
use rocket::serde::json::serde_json::json;
use serde::{Serialize, Deserialize};
use bitflags::bitflags;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
	avatar: String,
	description: String,
	theme: String,
	banner: String,
	accent_color: String
}


bitflags! {
	#[derive(Serialize, Deserialize)]
	pub struct Flags: u32 {
		const NONE = 0;
		const OWNER = 1 << 0;
		const DEVELOPER = 1 << 1;
		const MODERATOR = 1 << 2;
		const ADMIN = 1 << 3;
	}
}

#[derive(Serialize, Deserialize)]
pub struct InventoryItem {
	item: ObjectId,
	count: u32,
	name: Option<String>,
	description: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct User {
	username: String,
	settings: Settings,
	money: u32,
	flags: Flags,
	blocked: Vec<ObjectId>,
	inventory: Vec<InventoryItem>
}

// // This would have been really nice...
// impl<T: Serialize> From<T> for Bson {
// 	fn from(value: T) -> Self {
// 		bson::to_bson(&value).unwrap()
// 	}
// }

impl User {
	pub fn new(username: String) -> Self {
		Self {
			username,
			settings: Settings {
				avatar: String::new(),
				description: String::new(),
				theme: String::new(),
				banner: String::new(),
				accent_color: String::new()
			},
			inventory: Vec::new(),
			money: 0,
			flags: Flags::NONE,
			blocked: Vec::new()
		}
	}
}