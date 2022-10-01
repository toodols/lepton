use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Friendship {
    #[serde(rename = "_id")]
    id: ObjectId,
    to: ObjectId,
    from: ObjectId,
    accepted: bool,
}
