use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Group {
    name: String,
    is_public: bool,
    icon: String,
    description: String,
}
