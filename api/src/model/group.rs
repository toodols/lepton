use bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    #[serde(rename = "_id")]
    id: ObjectId,
    name: String,
    is_public: bool,
    icon: String,
    description: String,
}
