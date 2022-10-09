use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Group {
	#[serde(rename = "_id")]
	id: Id<Group>,
	name: String,
	is_public: bool,
	icon: String,
	description: String,
}

impl CollectionItem for Group {
	fn db() -> &'static str {
		"groups"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
