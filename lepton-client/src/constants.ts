const FETCH_BASE_URL = typeof window === "undefined" ? (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "idk lmao") : ""

export const DELETE_POST_URL = FETCH_BASE_URL + "/api/posts/delete";
export const CREATE_POST_URL = FETCH_BASE_URL + "/api/posts/create";
export const GET_POSTS_URL = FETCH_BASE_URL + "/api/posts/get";
export const EDIT_POST_URL = FETCH_BASE_URL + "/api/posts/edit";
export const VOTE_POST_URL = FETCH_BASE_URL + "/api/posts/vote";
export const GET_COMMENTS_URL = FETCH_BASE_URL + "/api/comments/get";
export const CREATE_COMMENT_URL = FETCH_BASE_URL + "/api/comments/create";
export const DELETE_COMMENT_URL = FETCH_BASE_URL + "/api/comments/delete";
export const EDIT_COMMENT_URL = FETCH_BASE_URL + "/api/comments/edit";
export const SIGN_UP_URL = FETCH_BASE_URL + "/api/signup";
export const SIGN_IN_URL = FETCH_BASE_URL + "/api/signin";
export const UPDATE_SETTINGS_URL = FETCH_BASE_URL + "/api/updatesettings";
export const GET_SELF_URL = FETCH_BASE_URL + "/api/users/lookup/@me";
export const GET_USER_URL = FETCH_BASE_URL + "/api/users/lookup/";
export const UNFOLLOW_USER_URL = FETCH_BASE_URL + "/api/users/unfollow";
export const FOLLOW_USER_URL = FETCH_BASE_URL + "/api/users/follow";
export const SEARCH_USERS_URL = FETCH_BASE_URL + "/api/searchusers";
export const CREATE_GROUP_URL = FETCH_BASE_URL + "/api/groups/create";
export const DELETE_GROUP_URL=  FETCH_BASE_URL +"/api/groups/delete";
export const EDIT_GROUP_URL = FETCH_BASE_URL + "/api/groups/edit";
export const SEARCH_GROUPS_URL = FETCH_BASE_URL + "/api/groups/search";
export const GET_GROUP_URL = FETCH_BASE_URL + "/api/groups/lookup/";
export const LOOKUP_ITEM_URL = FETCH_BASE_URL + "/api/items/lookup/";
export const FRIEND_USER_URL = FETCH_BASE_URL + "/api/users/friend";
export const UNFRIEND_USER_URL = FETCH_BASE_URL + "/api/users/unfriend";