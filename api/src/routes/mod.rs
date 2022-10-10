use rocket::{
	get,
	http::Status,
	options,
	response::{self, Responder},
	Request, Response, Route, State,
};
use std::{path::PathBuf, sync::Arc};

use crate::{DatabaseContext, DevelopmentMode};

use authenticate::{sign_in, sign_up};
pub use authorization::{AccessToken, AuthError};
use comments::{get_comment, get_comments};
pub use error::RequestError;
use followers::{follow, get_followers, unfollow};
use friends::{befriend, get_friends, unfriend};
use groups::get_groups;
use posts::{create_post, delete_post, get_posts};
use trade::create_trade;
use users::get_user;

mod authenticate;
mod comments;
mod followers;
mod friends;
mod groups;
mod polls;
mod posts;
mod trade;
mod users;
mod account;

mod authorization;
mod cursor;
mod error;

pub type DBState = State<DatabaseContext>;

#[get("/")]
pub fn test() -> &'static str {
	"For documentation please visit: <a href='https://github.com/toodols/lepton'>https://github.com/toodols/lepton/...</a>"
}

#[get("/debug")]
pub fn debug(state: &State<DevelopmentMode>) -> String {
	format!(r#"development mode: {}"#, state.0)
}

pub struct IAmSoFuckingFrustratedRightNow(bool);
impl<'r> Responder<'r, 'static> for IAmSoFuckingFrustratedRightNow {
	fn respond_to(self, _: &Request) -> response::Result<'static> {
		if self.0 {
			Response::build()
				.status(Status::Ok)
				.header(rocket::http::Header::new(
					"Access-Control-Allow-Origin",
					"*",
				))
				.header(rocket::http::Header::new(
					"Access-Control-Allow-Methods",
					"*",
				))
				.header(rocket::http::Header::new(
					"Access-Control-Allow-Headers",
					"*",
				))
				.header(rocket::http::Header::new(
					"Access-Control-Allow-Credentials",
					"true",
				))
				.ok()
		} else {
			Response::build().status(Status::Ok).ok()
		}
	}
}

#[options("/<path..>")]
pub fn cors(dev: &State<DevelopmentMode>, path: PathBuf) -> IAmSoFuckingFrustratedRightNow {
	IAmSoFuckingFrustratedRightNow(dev.0)
}

pub fn routes() -> Vec<Route> {
	rocket::routes![
		create_post,
		get_groups,
		get_posts,
		get_user,
		sign_in,
		sign_up,
		test,
		cors,
		debug,
		delete_post,
		get_comments,
		get_friends,
		befriend,
		unfriend,
		get_followers,
		follow,
		unfollow,
		get_comment,
		create_trade
	]
}
