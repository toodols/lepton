use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, Post, User};

#[derive(Debug, Serialize, Deserialize)]
pub struct Vote {
	id: Id<Vote>,
	post: Id<Post>,
	user: Id<User>,
	value: i32,
}
impl CollectionItem for Vote {
	fn db() -> &'static str {
		"votes"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
