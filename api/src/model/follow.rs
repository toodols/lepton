use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, User};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub struct Follow {
	#[serde(rename = "_id")]
	id: Id<Follow>,
	from: Id<User>,
	to: Id<User>,
}

impl CollectionItem for Follow {
	fn db() -> &'static str {
		"follows"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
