use serde::{Serialize, Deserialize};

use super::{Post, User, Id, CollectionItem};

#[derive(Debug, Serialize, Deserialize)]
pub struct Vote {
	id: Id<Vote>,
	post: Id<Post>,
	user: Id<User>,
	value: i32,
}
impl CollectionItem for Vote {
	fn collection_name() -> &'static str {
		"votes"
	}
}