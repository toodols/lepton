use serde::{Serialize, Deserialize};

use super::{User, Group, Id, CollectionItem};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupUser {
	id: Id<GroupUser>,
	group: Id<Group>,
	user: Id<User>,
	is_in_group: bool,
}

impl CollectionItem for GroupUser {
	fn collection_name() -> &'static str {
		"groupUsers"
	}
}