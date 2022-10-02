use std::{path::PathBuf, sync::Arc};
use rocket::{
	get,
	http::Status,
	options,
	response::{self, Responder},
	Request, Response, Route, State,
};

use crate::{DatabaseContext, DevelopmentMode};

use authenticate::{sign_in, sign_up};
pub use authorization::{AccessToken, AuthError};
pub use error::GenericRequestError;
use groups::get_groups;
use posts::{create_post, get_posts};
use users::get_user;

mod authenticate;
mod groups;
mod posts;
mod users;

mod cursor;
mod authorization;
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
		debug
	]
}
