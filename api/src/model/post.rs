use bson::DateTime;
use mongodb::bson::{oid::ObjectId, Timestamp};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
	#[serde(rename = "_id")]
	id: ObjectId,
    created_at: DateTime,
    author: ObjectId,
    content: String,
    group: Option<ObjectId>,
    attachments: Vec<Attachment>,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[serde(rename_all = "camelCase")]
pub enum Attachment {
    Image { url: String },
    Poll { id: ObjectId },
}
