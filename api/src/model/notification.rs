use serde::{Deserialize, Serialize};

use super::{CollectionItem, Friendship, Id};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Notification {
	id: Id<Notification>,
	#[serde(flatten)]
	content: NotificationContent,
}

impl CollectionItem for Notification {
	fn db() -> &'static str {
		"notifications"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "content")]
#[serde(rename_all = "camelCase")]
pub enum NotificationContent {
	FriendshipAccepted { id: Id<Friendship> },
	NewFriendRequest { id: Id<Friendship> },
}

#[test]
fn test() {
	let t = Notification {
		id: Id::new(),
		content: NotificationContent::FriendshipAccepted { id: Id::new() },
	};
	let v = serde_json::to_string(&t).unwrap();
	println!("{}", v);
}
