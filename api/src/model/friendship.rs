use mongodb::Collection;
use serde::{Deserialize, Serialize};

use super::{User, Id, CollectionItem};

#[derive(Deserialize, Serialize, Clone)]
pub struct Friendship {
	#[serde(rename = "_id")]
	id: Id<Friendship>,
	to: Id<User>,
	from: Id<User>,
	accepted: bool,
}


impl CollectionItem for Friendship {
	fn collection_name() -> &'static str {
		"friendships"
	}
}