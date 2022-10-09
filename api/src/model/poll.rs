use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, User};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Poll {
	id: Id<Poll>,
	question: String,
	options: Vec<Option<String>>,
}

impl CollectionItem for Poll {
	fn db() -> &'static str {
		"polls"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PollResponse {
	id: Id<PollResponse>,
	poll: Id<Poll>,
	user: Id<User>,
	option: usize,
}

impl CollectionItem for PollResponse {
	fn db() -> &'static str {
		"pollResponses"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
