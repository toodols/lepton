use mongodb::bson::oid::ObjectId;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Comment {
	content: String,
	author: ObjectId,
	post: ObjectId,
	#[serde(skip_serializing_if = "Option::is_none")]
	reply_to: Option<ObjectId>,
}
