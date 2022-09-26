use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Friendship {
	to: ObjectId,
	from: ObjectId,
	accepted: bool
}