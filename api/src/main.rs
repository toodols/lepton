#![feature(decl_macro)]
mod cors;
mod model;
mod routes;

use model::{Auth, Group, Post, User};
use mongodb::{
    options::{ClientOptions, ResolverConfig},
    Client, Collection,
};
use std::{env, sync::Arc};

pub struct DatabaseContext {
	#[allow(unused)]
    client: Client,
    posts: Collection<Post>,
    users: Collection<User>,
    groups: Collection<Group>,
    auth: Collection<Auth>,
}

pub struct DevelopmentMode(bool);

#[rocket::main]
async fn main() {
    let rocket_env = env::var("ROCKET_ENV").expect("env not there");

    if rocket_env == "development" {
        dotenv::from_path("../.env.local").unwrap();
    }

    let client_uri =
        env::var("MONGODB_URI").expect("You must set the MONGODB_URI environment var!");
    let options =
        ClientOptions::parse_with_resolver_config(&client_uri, ResolverConfig::cloudflare())
            .await
            .unwrap();
    let client = Client::with_options(options).unwrap();
    let database_context = DatabaseContext {
        client: client.clone(),
        posts: client.database("database").collection("posts"),
        users: client.database("database").collection("users"),
        groups: client.database("database").collection("groups"),
        auth: client.database("database").collection("auth"),
    };

    let r = rocket::build()
        .manage(database_context)
        .manage(DevelopmentMode(rocket_env == "development"))
        .mount("/api", routes::routes())
        .attach(cors::CORS(rocket_env == "development"))
        .launch()
        .await
        .unwrap();
}
