use bitflags::bitflags;
use mongodb::bson::{oid::ObjectId, Bson};
use rocket::serde::json::serde_json::{json, self};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    avatar: String,
    description: String,
    theme: String,
    banner: String,
    accent_color: String,
}

bitflags! {
    pub struct Flags: u32 {
        const NONE = 0;
        const OWNER = 1 << 0;
        const DEVELOPER = 1 << 1;
        const MODERATOR = 1 << 2;
        const ADMIN = 1 << 3;
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
fn de_bitflags(){
	let s = "5";
	let flags: Flags = serde_json::from_str(s).unwrap();
	assert_eq!(flags, Flags::MODERATOR | Flags::OWNER);
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
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub settings: Settings,
    pub money: u32,
    pub flags: Flags,
    pub blocked: Vec<ObjectId>,
    pub inventory: Vec<InventoryItem>,
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
            id: None,
            username,
            settings: Settings {
                avatar: String::new(),
                description: String::new(),
                theme: String::new(),
                banner: String::new(),
                accent_color: String::new(),
            },
            inventory: Vec::new(),
            money: 0,
            flags: Flags::NONE,
            blocked: Vec::new(),
        }
    }
}
