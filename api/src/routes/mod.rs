use std::{path::PathBuf, sync::Arc};

use rocket::{
    get,
    http::Status,
    options,
    response::{self, Responder},
    serde::json::{serde_json::json, Json},
    Request, Response, Route, State,
};

use crate::{DatabaseContext, DevelopmentMode};

mod authenticate;
mod groups;
mod posts;

use authenticate::{sign_in, sign_up};
use groups::get_groups;
use posts::{create_post, get_posts};

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
        sign_in,
		sign_up,
        test,
        cors,
        debug
    ]
}

pub struct GenericRequestError(Status, String);
impl GenericRequestError {
    fn idc() -> Self {
        Self(
            Status::InternalServerError,
            "Some stupid erorr I don't have time to deal iwth.".to_string(),
        )
    }
}
impl<'r> Responder<'r, 'static> for GenericRequestError {
    fn respond_to(self, req: &'r Request<'_>) -> response::Result<'static> {
        let string = json!({
            "error": self.1
        });
        Response::build_from(string.respond_to(req)?)
            .status(self.0)
            .ok()
    }
}
