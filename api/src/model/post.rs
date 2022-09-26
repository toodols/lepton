use mongodb::bson::{oid::ObjectId, Timestamp};
use serde::{Serialize, Deserialize};

#[derive(Serialize,Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
	created_at: Timestamp,
	author: ObjectId,
	content: String,
	group: Option<ObjectId>,
	attachments: Vec<Attachment>,
}

#[derive(Serialize,Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Attachment {
	Image {
		url: String
	},
	Poll {
		id: ObjectId
	}
}