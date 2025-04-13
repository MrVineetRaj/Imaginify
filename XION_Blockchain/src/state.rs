use schemars::JsonSchema;
use serde::{Deserialize, Serialize}; 

use cosmwasm_std::Addr;
use cw_storage_plus::{Item,Map};


// Contract configuration
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct Config {
    pub admin: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct Transaction {
    pub credits: u128,
    pub label: String,
    pub timestamp: u128,
    pub amount_used: u128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct User{
    pub credit_balance: u128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct ImageData{
    pub image_id: String,           // Unique image ID
    pub author:Addr,
    pub original_image_url: String,
    pub edited_image_url: String,
    pub title: String,
    pub prompt: String,
    pub like_count: u128,
    pub dislike_count: u128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq,JsonSchema)]
pub struct ImageComment {
    pub comment_id: String,           // Unique comment ID
    pub image_id: String,     // ID of the image being commented on
    pub author: Addr,         // Who made the comment
    pub comment: String,
    pub timestamp: String,      // When the comment was created
}

// User credit tracking
pub const CONFIG: Item<Config> = Item::new("config");
pub const USERS: Map<&Addr, User> = Map::new("user_credit");
pub const TRANSACTIONS: Map<&Addr, Vec<Transaction>> = Map::new("transactions");

// Image related data
pub const IMAGES: Map<String, ImageData> = Map::new("images");
pub const USER_IMAGES: Map<&Addr, Vec<String>> = Map::new("user_images");

// pub const IMAGE_IDS: Map<String, String> = Map::new("image_ids");
// Image comments 
pub const COMMENTS: Map<String, ImageComment> = Map::new("comments");
pub const IMAGE_COMMENTS: Map<String, Vec<String>> = Map::new("image_comments");

//Liked images
pub const LIKED_IMAGES: Map<&Addr, Vec<String>> = Map::new("liked_images");

// image likes
pub const LIKES: Map<String, Vec<Addr>> = Map::new("likes");
// image dislikes
pub const DISLIKES: Map<String, Vec<Addr>> = Map::new("dislikes");