use chrono::{DateTime, Utc};
use mongodb::bson::{oid::ObjectId};
use serde::{Deserialize, Serialize};

use super::{Id, User, Group, CollectionItem};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
	#[serde(rename = "_id")]
	id: Id<Post>,
	#[serde(with = "chrono::serde::ts_milliseconds")]
	updated_at: DateTime<Utc>,
	author: Id<User>,
	content: String,
	group: Option<Id<Group>>,
	attachments: Vec<Attachment>,
}

impl CollectionItem for Post {
	fn collection_name() -> &'static str {
		"posts"
	}
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Attachment {
	Image { url: String },
	Poll { id: ObjectId },
}
