use serde::{Deserialize, Serialize};

use super::{Id, CollectionItem};

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
	fn collection_name() -> &'static str {
		"groups"
	}
}