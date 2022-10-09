use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, Post, User};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Comment {
	#[serde(rename = "_id")]
	id: Id<Comment>,
	content: String,
	author: Id<User>,
	post: Id<Post>,
	#[serde(skip_serializing_if = "Option::is_none")]
	reply_to: Option<Id<Comment>>,
}

impl CollectionItem for Comment {
	fn db() -> &'static str {
		"comments"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
