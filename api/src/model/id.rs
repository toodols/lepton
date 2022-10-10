use bson::oid::ObjectId;
use bson::{Bson, Document, SerializerOptions};
use rocket::form::FromFormField;
use rocket::http::Status;
use rocket::request::FromParam;
use serde::{Deserialize, Serialize};
use std::any::type_name;
use std::fmt::Debug;
use std::hash::{Hash, Hasher};
use std::{fmt::Formatter, str::FromStr};

use crate::routes::RequestError;

pub trait CollectionItem: for<'de> Deserialize<'de> + Serialize + Unpin + Send + Sync {
	fn db() -> &'static str;
	fn col() -> &'static str {
		"database"
	}
	fn id(&self) -> Id<Self>;
	fn to_bson(&self) -> Result<Bson, bson::ser::Error> {
		bson::to_bson_with_options(
			self,
			SerializerOptions::builder().human_readable(false).build(),
		)
	}
}

#[derive(PartialEq, Eq)]
pub struct Id<T: CollectionItem> {
	inner: ObjectId,
	phantom: std::marker::PhantomData<T>,
}

pub type IdResult<T> = Result<Id<T>, RequestError>;

impl<T: CollectionItem> Id<T> {
	pub fn new() -> Self {
		Id {
			inner: ObjectId::new(),
			phantom: std::marker::PhantomData,
		}
	}
	pub fn into_query(self) -> bson::Document {
		bson::doc! {"_id": self.inner}
	}
}

impl<T: CollectionItem> From<ObjectId> for Id<T> {
	fn from(id: ObjectId) -> Self {
		Id {
			inner: id,
			phantom: std::marker::PhantomData,
		}
	}
}

impl<'a, T: CollectionItem> FromParam<'a> for Id<T> {
	type Error = RequestError;
	fn from_param(param: &'a str) -> Result<Self, Self::Error> {
		Id::from_str(param).map_err(|_| {
			RequestError(
				Status::BadRequest,
				format!("An invalid id was passed in for param '{param}'"),
			)
		})
	}
}

impl<'a, T: CollectionItem> FromFormField<'a> for Id<T> {
	fn from_value(value: rocket::form::ValueField<'a>) -> rocket::form::Result<Self> {
		Ok(Id::<T>::from_str(value.value).map_err(|_| value.unexpected())?)
	}
}

impl<T: CollectionItem> Hash for Id<T> {
	fn hash<H: Hasher>(&self, state: &mut H) {
		self.inner.hash(state)
	}
}
impl<T: CollectionItem> Debug for Id<T> {
	fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
		write!(f, "{}Id({})", type_name::<T>(), self.inner.to_hex())
	}
}
impl<T: CollectionItem> FromStr for Id<T> {
	type Err = <ObjectId as FromStr>::Err;
	fn from_str(s: &str) -> Result<Self, Self::Err> {
		Ok(Id {
			inner: ObjectId::from_str(s)?,
			phantom: std::marker::PhantomData,
		})
	}
}
impl<T: CollectionItem> Copy for Id<T> {}
impl<T: CollectionItem> Clone for Id<T> {
	fn clone(&self) -> Self {
		*self
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
impl<T: CollectionItem> From<Id<T>> for Bson {
	fn from(id: Id<T>) -> Self {
		Bson::ObjectId(id.inner)
	}
}
// ObjectId can deserialize both from "id" and {$oid: "id"}
impl<'de, T: CollectionItem> Deserialize<'de> for Id<T> {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		let value = ObjectId::deserialize(deserializer)?;
		Ok(Id {
			inner: value,
			phantom: std::marker::PhantomData,
		})
	}
}

#[test]
fn deser_oid_with_str() {
	let val: ObjectId = bson::from_bson(bson::bson!({
		"$oid": "0123456789abcdef01234567"
	}))
	.unwrap();
	println!("{:?}", val);
	let val2: ObjectId = bson::from_bson(bson::bson!("0123456789abcdef01234567")).unwrap();
	println!("{:?}", val2);
}
