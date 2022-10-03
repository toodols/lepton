use std::{collections::HashMap};

use bson::{doc, oid::ObjectId};
use mongodb::Collection;
use serde::{Deserialize, Serialize};

use super::{CollectionItem, Id};

/*

Item {
	id: ..,
	type: "",
	name: ""
}

*/

// they can be grouped into subcategories by the client
// no need to be done on the server
#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Debug)]
#[serde(tag = "type", content="attributes")]
#[serde(rename_all = "camelCase")]
pub enum ItemAttribute {
	None,
	Consumable {
		// idk
	},
	Weapon {
		damage: u32,
	},
	BackgroundDecoration(BackgroundDecoration)
}

impl ItemAttribute {
	pub fn is_none(&self) -> bool {
		return &ItemAttribute::None == self
	}
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Debug)]
pub struct BackgroundDecoration {
	// image url, gif, whatever the hell goes here
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Item {
	#[serde(rename = "_id")]
	pub id: Id<Item>,
	pub name: String,
	pub description: String,
	pub icon: String,
	/// Some items, not user-generated can be hard-coded into the server.
	/// They are given a tag that are used to identify them instead of their id.
	/// They can also be given their own functionality.
	#[serde(skip_serializing_if = "Option::is_none")]
	pub tag: Option<String>,
	#[serde(flatten)]
	pub attributes: ItemAttribute
}

macro_rules! dumb_item {
	({ name: $name:expr, description: $desc: expr, icon: $icon: expr, tag: $tag: expr }) => {
		Item {
			id: Id::new(),
			name: $name.to_string(),
			description: $desc.to_string(),
			icon: $icon.to_string(),
			tag: Some($tag.to_string()),
			attributes: ItemAttribute::None
		}
	};
}

impl Item {
	pub fn generate_items() -> Vec<Item> {
		vec![
			dumb_item!({
				name: "Hatsune Miku Figurine",
				description: "Why do you even have this...",
				icon: "ajoafjoiafewijofaewiojafijeo",
				tag: "hatsune-miku-figurine"
			}),
		]
	}
}

impl CollectionItem for Item {
	fn collection_name() -> &'static str {
		"items"
	}
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
/// Items with the same type and discriminant SHOULD have the same name and description
pub struct InventoryItem {
	pub item: Id<Item>,
	pub count: u32,
	pub discriminant: u64,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub name: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub description: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	pub icon: Option<String>,
	#[serde(skip_serializing_if = "Option::is_none")]
	#[serde(flatten)]
	pub attributes: Option<ItemAttribute>
}

impl InventoryItem {
	/// Return a clone of `self` but with count changed to `new_count`
	fn as_count(&self, new_count: u32) -> Self {
		let mut val = self.clone();
		val.count = new_count;
		return val;
	}
}

/// Should provide all item types by ItemId synchronously.
trait ItemProvider {
	fn get_item(&self, id: Id<Item>) -> Result<&Item, ()>;
}

impl ItemProvider for HashMap<Id<Item>, Item> {
    fn get_item<'a>(&'a self, id: Id<Item>) -> Result<&'a Item, ()>{
		self.get(&id).ok_or(())
	}
}

struct Inventory {
	items: Vec<InventoryItem>
}
impl Serialize for Inventory {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer {
        self.items.serialize(serializer)
    }
}
impl<'de> Deserialize<'de> for Inventory {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de> {
        Vec::<InventoryItem>::deserialize(deserializer).map(|items|Inventory{items})
    }
}

// reason i don't use std::ops is because it's just not right for the job
impl Inventory {
	pub async fn get_item_provider(&self, collection: Collection<Item>) -> Result<HashMap<Id<Item>, Item>, ()> {
		let items = self.items.iter().map(|ii|ii.item.into()).collect::<Vec<ObjectId>>();
		let mut cursor = collection.find(doc!{
			"_id": {"$in": items}
		}, None).await.map_err(|_|())?;
		let mut map: HashMap<Id<Item>, Item> = HashMap::new();
		while cursor.advance().await.map_err(|_|())? {
			let v: Item = cursor.deserialize_current().map_err(|_|())?;
			map.insert(v.id, v);
		}
		Ok(map)
	}
	/// Finds corresponding [InventoryItem] in self with matching type and discriminant and returns its index, or returns None if not found
	fn find_inventory_item(&self, target: &InventoryItem) -> Option<usize> {
		for (index, item) in self.items.iter().enumerate() {
			if item.item == target.item && item.discriminant == target.discriminant {
				return Some(index);
			}
		}
		return None;
	}
	/// Immutably subtracts self from rhs, errors if underflows
	/// O(#self * #rhs) -> O(n^2) 😢
	/// tbf we're using rust so it will be blazingly fast so it's fine...
    pub fn sub(&self, rhs: Inventory) -> Result<Inventory, ()> {
		let mut new_items: Vec<InventoryItem> = Vec::with_capacity(self.items.len());
		for item in self.items.iter() {
			if let Some(index) = rhs.find_inventory_item(item) {
				let InventoryItem{count,..} = rhs.items[index];
				if item.count < count {
					// item doesn't have enough count
					return Err(())
				} else if item.count == count {
					// ok, this is just skipped
				} else if item.count > count {
					// subtract item.count from count and add to new items
					new_items.push(item.as_count(item.count - count));
				}
			}
		}
		Ok(Inventory{items:new_items})
    }
}