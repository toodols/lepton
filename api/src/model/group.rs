use mongodb::Client;
use serde::{Deserialize, Serialize};

use crate::DatabaseContext;

use super::{CollectionItem, Id};

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum GroupPrivacy {
	Private,
	Public,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Group {
	#[serde(rename = "_id")]
	pub id: Id<Group>,
	pub name: String,
	pub privacy: GroupPrivacy,
	pub icon: String,
	pub description: String,
}

impl CollectionItem for Group {
	fn db() -> &'static str {
		"groups"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
