use mongodb::Collection;
use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, User};

#[derive(Deserialize, Serialize, Clone)]
pub struct Friendship {
	#[serde(rename = "_id")]
	pub id: Id<Friendship>,
	pub to: Id<User>,
	pub from: Id<User>,
	pub accepted: bool,
}

impl Friendship {
	pub fn new(to: Id<User>, from: Id<User>) -> Self {
		Self {
			id: Id::new(),
			to,
			from,
			accepted: false,
		}
	}
}

impl CollectionItem for Friendship {
	fn db() -> &'static str {
		"friendships"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
