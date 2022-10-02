use serde::Serialize;

use super::{User, Post, Id, CollectionItem};

#[derive(Serialize)]
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
	fn collection_name() -> &'static str {
		"comments"
	}
}