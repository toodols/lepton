use bson::doc;
use mongodb::{Client, IndexModel, options::{IndexOptions, IndexOptionsBuilder, Collation, CollationStrength}};
use rocket::serde::json::serde_json::json;

use crate::model::{Group, CollectionItem, Post, Auth};

// tfw when you spend a couple hours making a bunch of stupid macros that end up making your code longer than shorter
// at least i get +50 lines of code!

// idk why i cant match numbers so weird
// macro_rules! collation_strength {
// 	(1) => {
// 		CollationStrength::Primary
// 	};
// 	(2) => {
// 		CollationStrength::Secondary
// 	};
// 	($expr: expr) => {
// 		compile_error!(stringify!("Invalid collation strength" $expr))
// 	};
// }

macro_rules! collation {
	($s: expr, strength: $expr: expr) => {
		$s.strength(match $expr {
			1 => CollationStrength::Primary,
			2 => CollationStrength::Secondary,
			_ => panic!("Invalid collation strength {}", $expr)
		})
	};
	($s: expr, locale: $expr: expr) => {
		$s.locale($expr)
	};
}

macro_rules! collations {
	($name: ident: $opt: expr) => {
		collation!(Collation::builder(), $name: $opt)
	};
	($name_0: ident: $opt_0: expr, $($name: ident: $opt: expr),+) => {
		collation!(collations!($( $name: $opt ),+), $name_0: $opt_0)
	};
}


macro_rules! option {
	($s: expr, unique: $tt: tt) => {
		$s.unique($tt)
	};
	($s: expr, collation: $tt: tt) => {
		$s.collation((collations!$tt).build())
	};
}

macro_rules! options {
	($name: ident: $opt: tt) => {
		option!(IndexOptions::builder(), $name: $opt)
	};
	($name_0: ident: $opt_0: tt, $($name: ident: $opt: tt),+) => {
		option!(options!($( $name: $opt ),+), $name_0: $opt_0)
	};
}

macro_rules! index {
	($keys: tt, $opts: tt) => {
		IndexModel::builder()
			.keys(doc!$keys)
			.options((options!$opts).build())
			.build()
	};
	($keys: tt) => {
		IndexModel::builder().keys(doc!$keys).build()
	};
}

pub async fn add_indexes(db: &Client){
	db.database(Auth::db()).collection::<Auth>(Auth::col()).create_index(index!({
		"username": 1
	}, {
		unique: true,
		collation: {
			locale: "en",
			strength: 1
		}
	}), None).await.expect("Failed to create index");
}