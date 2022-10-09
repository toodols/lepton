use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id, InventoryItem, User};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
enum TradeStatus {
	/// The trade is pending and has not been accepted or declined
	Pending,
	/// The trade was accepted by the recipient
	Accepted,
	/// The trade was declined by the recipient
	Declined,
	/// The trade was canceled by the sender
	Canceled,
	/// The trade has expired and is no longer valid
	Expired,
}

/// A trade between two users for items in their inventories
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Trade {
	id: Id<Trade>,
	from: Id<User>,
	to: Id<User>,
	items_offered: Vec<InventoryItem>,
	items_requested: Vec<InventoryItem>,
	status: TradeStatus,
	expires: DateTime<Utc>,
}

impl CollectionItem for Trade {
	fn db() -> &'static str {
		"trades"
	}
	fn id(&self) -> Id<Self> {
		self.id
	}
}

impl Default for Trade {
	fn default() -> Self {
		Self {
			id: Id::new(),
			from: Id::new(),
			to: Id::new(),
			items_offered: vec![],
			items_requested: vec![],
			status: TradeStatus::Pending,
			expires: Utc::now() + chrono::Duration::days(1),
		}
	}
}

impl Trade {
	pub fn new(
		from: Id<User>,
		to: Id<User>,
		items_offered: Vec<InventoryItem>,
		items_requested: Vec<InventoryItem>,
	) -> Self {
		Self {
			from,
			to,
			items_offered,
			items_requested,
			..Default::default()
		}
	}
}
