use serde::{Serialize, Deserialize};

use super::{Id, User, CollectionItem};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
struct Follow {
	#[serde(rename = "_id")]
	id: Id<Follow>,
	from: Id<User>,
	to: Id<User>,
}

impl CollectionItem for Follow {
	fn collection_name() -> &'static str {
		"follows"
	}
}