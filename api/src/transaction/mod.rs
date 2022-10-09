// why create a new module with shitty transaction system?
// 1. rust-analyzer has a hard time inferring types
// 2. the boilerplate is insane

use std::any::Any;

use bson::Document;
use futures::{future::BoxFuture, FutureExt};
use mongodb::options::{Collation, UpdateModifications, FindOneAndUpdateOptions, FindOneOptions};
use mongodb::{Client, Collection};
use rocket::http::Status;

use crate::{
	model::{CollectionItem, Id, Post},
	routes::RequestError,
};

pub struct Transaction {
	client: Client,
	session: mongodb::ClientSession,
}

pub struct TransactionError {
	message: String,
}

impl TransactionError {
	fn new(message: &str) -> Self {
		Self {
			message: message.to_string(),
		}
	}
}

impl From<TransactionError> for RequestError {
	fn from(err: TransactionError) -> Self {
		RequestError(Status::InternalServerError, err.message)
	}
}

impl Transaction {
	fn collection<T: CollectionItem>(&mut self) -> Collection<T> {
		self.client.database(T::col()).collection(T::db())
	}
	pub async fn get<T: CollectionItem>(
		&mut self,
		id: Id<T>,
	) -> Result<Option<T>, TransactionError> {
		self.collection::<T>()
			.find_one_with_session(id.into_query(), None, &mut self.session)
			.await
			.map_err(|e| TransactionError {
				message: e.to_string(),
			})
	}
	pub async fn insert<T: CollectionItem>(&mut self, item: T) -> Result<Id<T>, TransactionError> {
		self.collection::<T>()
			.insert_one_with_session(item, None, &mut self.session)
			.await
			.map_err(|e| TransactionError {
				message: e.to_string(),
			}).map(|r|r.inserted_id.as_object_id().unwrap().into())
	}
	pub async fn update<T: CollectionItem>(&mut self, item: T) -> Result<(), TransactionError> {
		self.collection::<T>()
			.find_one_and_replace_with_session(
				item.id().into_query(),
				item,
				None,
				&mut self.session,
			)
			.await
			.map_err(|e| TransactionError {
				message: e.to_string(),
			}).map(|_|())
	}
	pub async fn find_one<T: CollectionItem>(
		&mut self,
		query: impl Into<Option<Document>>,
		options: impl Into<Option<FindOneOptions>>,
	) -> Result<Option<T>, TransactionError> {
		self.collection::<T>()
			.find_one_with_session(query, options, &mut self.session)
			.await
			.map_err(|e| TransactionError {
				message: e.to_string(),
			})
	}
	pub async fn find_one_and_update<T: CollectionItem>(
		&mut self,
		query: Document,
		update: impl Into<UpdateModifications>,
		options: impl Into<Option<FindOneAndUpdateOptions>>,
	) -> Result<Option<T>, TransactionError> {
		self.collection::<T>()
			.find_one_and_update_with_session(
				query,
				update,
				None,
				&mut self.session,
			)
			.await
			.map_err(|e| TransactionError {
				message: e.to_string(),
			})
	}
}

// bruh https://users.rust-lang.org/t/lifetime-may-not-live-long-enough-for-an-async-closure/62489/2

pub async fn create_transaction<T, E: From<TransactionError>, F>(
	client: Client,
	cb: F,
) -> Result<T, E>
where
	F: FnOnce(&mut Transaction) -> BoxFuture<'_, Result<T, E>>,
{
	let session = client
		.start_session(None)
		.await
		.map_err(|_| E::from(TransactionError::new("error")))
		.map_err(|_| E::from(TransactionError::new("error")))?;
	let mut transaction = Transaction { client, session };
	let e = cb(&mut transaction).await?;
	transaction
		.session
		.commit_transaction()
		.await
		.map_err(|_| E::from(TransactionError::new("error")))
		.map_err(|_| E::from(TransactionError::new("error")))?;
	return Ok(e);
}

#[tokio::test]
async fn example() {
	let client = mongodb::Client::with_uri_str("afjioiefwaifajioafew")
		.await
		.unwrap();
	let res: Result<(), RequestError> = create_transaction(client.clone(), |transaction| {
		async move {
			let post = transaction.get(Id::<Post>::new()).await;

			Ok(())
		}
		.boxed()
	})
	.await;
}
