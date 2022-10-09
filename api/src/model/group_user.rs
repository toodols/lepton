use serde::{Deserialize, Serialize};

use super::{CollectionItem, Group, Id, User};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupUser {
	id: Id<GroupUser>,
	group: Id<Group>,
	user: Id<User>,
	is_in_group: bool,
}

impl CollectionItem for GroupUser {
	fn db() -> &'static str {
		"groupUsers"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}
