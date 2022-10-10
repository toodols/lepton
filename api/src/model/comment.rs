use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, Post, User};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Comment {
	#[serde(rename = "_id")]
	pub id: Id<Comment>,
	pub content: String,
	pub author: Id<User>,
	pub post: Id<Post>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub reply_to: Option<Id<Comment>>,
}

impl CollectionItem for Comment {
	fn db() -> &'static str {
		"comments"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
