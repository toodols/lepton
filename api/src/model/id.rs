use std::any::type_name;
use std::hash::{Hash,Hasher};
use std::{str::FromStr, fmt::Formatter};
use std::fmt::Debug;
use bson::oid::ObjectId;
use serde::{Serialize, Deserialize};

pub trait CollectionItem {
	fn collection_name() -> &'static str;
}

#[derive(PartialEq, Eq)]
pub struct Id<T: CollectionItem>{inner: ObjectId, phantom: std::marker::PhantomData<T>}
impl<T: CollectionItem> Hash for Id<T> {
	fn hash<H: Hasher>(&self, state: &mut H) {
		self.inner.hash(state)
	}
}
impl<T: CollectionItem> Debug for Id<T> {
	fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
		write!(f, "{}Id({})", type_name::<T>(),	self.inner.to_hex())
	}
}
impl<T: CollectionItem> FromStr for Id<T> {
	type Err = <ObjectId as FromStr>::Err;
	fn from_str(s: &str) -> Result<Self, Self::Err> {
		Ok(Id{inner: ObjectId::from_str(s)?, phantom: std::marker::PhantomData})
	}
}
impl<T: CollectionItem> Copy for Id<T> {}
impl<T: CollectionItem> Clone for Id<T> {
	fn clone(&self) -> Self {
		*self
	}
}
impl<T: CollectionItem> Id<T> {
	pub fn new() -> Self {
		Id{inner: ObjectId::new(), phantom: std::marker::PhantomData}
	}
	pub fn into_query(self) -> bson::Document {
		bson::doc!{"_id": self.inner}
	}
}
impl<T: CollectionItem> ToString for Id<T> {
	fn to_string(&self) -> String {
		self.inner.to_hex()
	}
}
impl<T: CollectionItem> Serialize for Id<T> {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer,
	{
		if serializer.is_human_readable() {
			serializer.serialize_str(&self.inner.to_hex())
		} else {
			self.inner.serialize(serializer)
		}
	}
}
impl<T: CollectionItem> From<Id<T>> for ObjectId {
	fn from(id: Id<T>) -> Self {
		id.inner
	}
}
impl<T: CollectionItem> From<ObjectId> for Id<T> {
	fn from(id: ObjectId) -> Self {
		Id{inner: id, phantom: std::marker::PhantomData}
	}
}

// ObjectId can deserialize both from "id" and {$oid: "id"}
impl<'de, T: CollectionItem> Deserialize<'de> for Id<T> {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let value = ObjectId::deserialize(deserializer)?;
		Ok(Id{inner: value, phantom: std::marker::PhantomData})
	}
}

#[test]
fn deser_oid_with_str(){
	let val: ObjectId = bson::from_bson(bson::bson!({
		"$oid": "0123456789abcdef01234567"
	})).unwrap();
	println!("{:?}", val);
	let val2: ObjectId = bson::from_bson(bson::bson!("0123456789abcdef01234567")).unwrap();
	println!("{:?}", val2);
}