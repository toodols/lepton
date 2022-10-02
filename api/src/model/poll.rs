use serde::{Serialize, Deserialize};

use super::{Id, User, CollectionItem};

#[derive(Serialize,Deserialize, Debug, Clone)]
pub struct Poll {
	id: Id<Poll>,
	question: String,
	options: Vec<Option<String>>,
}

impl CollectionItem for Poll {
	fn collection_name() -> &'static str {
		"polls"
	}
}

#[derive(Serialize,Deserialize, Debug, Clone)]
pub struct PollResponse {
	id: Id<PollResponse>,
	poll: Id<Poll>,
	user: Id<User>,
	option: usize,
}

impl CollectionItem for PollResponse {
	fn collection_name() -> &'static str {
		"pollResponses"
	}
}

