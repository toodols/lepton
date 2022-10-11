use bson::DateTime;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

use super::{CollectionItem, Group, Id, User};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
	#[serde(rename = "_id")]
	pub id: Id<Post>,
	pub updated_at: DateTime,
	pub author: Id<User>,
	pub content: String,
	pub group: Option<Id<Group>>,
	pub attachments: Vec<Attachment>,
}

impl Post {
	pub fn new(content: String, author: Id<User>, group: Option<Id<Group>>) -> Self {
		Self {
			id: Id::new(),
			updated_at: DateTime::now(),
			author,
			content,
			group,
			attachments: Vec::new(),
		}
	}
}

impl CollectionItem for Post {
	fn db() -> &'static str {
		"posts"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Attachment {
	Image { url: String },
	Poll { id: ObjectId },
}
