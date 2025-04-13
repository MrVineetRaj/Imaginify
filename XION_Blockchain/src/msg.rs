use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;use crate::state::{Config, ImageComment, ImageData, Transaction, User};

//info : Below is the message to instantiate the contract
#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<String>,  
}

//info : Message for registering a new user on the platform
#[cw_serde]
pub struct RegisterUserMessage {}

//info : Message for purchasing credits
#[cw_serde]
pub struct BuyCreditsMessage {
    pub bundle: String,
}

//info : Message for using credits
#[cw_serde]
pub struct UseCreditsMessage {
    pub credits: u128,
}

//info : Message for creating image
#[cw_serde]
pub struct CreateImageMessage {
    pub image_id: String,
    pub author: Addr,
    pub original_image_url: String,
    pub edited_image_url: String,
    pub title: String,
    pub prompt: String,
}

//info : Message for liking an image
#[cw_serde]
pub struct LikeImageMessage {
    pub image_id: String,
}

//info : Message for disliking an image
#[cw_serde]
pub struct DislikeImageMessage {
    pub image_id: String,
}

//info : Message for creating a comment on an image
#[cw_serde]
pub struct CreateCommentMessage {
    pub comment_id: String,
    pub image_id: String,
    pub author: Addr,
    pub comment: String,
    pub timestamp: String,
}




//info : Contract executable messages that trigger state changes
#[cw_serde]
pub enum ExecuteMsg {
    RegisterUser(RegisterUserMessage),
    BuyCredits(BuyCreditsMessage),
    UseCredits(UseCreditsMessage),
    CreateImage(CreateImageMessage),
    LikeImage(LikeImageMessage),
    DislikeImage(DislikeImageMessage),
    CreateComment(CreateCommentMessage),
    WithdrawMoney {},
}

// Info : Query messages for reading contract state without modifications
#[cw_serde]
pub enum QueryMsg {
    GetConfig {},
    GetUser { address: Addr },
    GetTransactions { address: Addr },
    GetImages {}, 
    GetImage { image_id: String },
    GetUserImages { address: Addr },
    GetImageComments { image_id: String }, // must be image_id instead of comment_id
    GetLikedImages { address: Addr },
    GetComment { comment_id: String },
}

//info : Response wrapper for contract configuration information
#[cw_serde]
pub struct ConfigResponse {
    pub config: Config,
}

//info : Response wrapper for user account information
#[cw_serde]
pub struct UserResponse {
    pub user: User,
    pub is_registered: bool,
}

//info : Response wrapper for transaction history lookup
#[cw_serde]
pub struct TransactionsResponse {
    pub transactions: Vec<Transaction>,
}

//info : Response wrapper for all images lookup
#[cw_serde]
pub struct ImagesResponse {
    pub images: Vec<String>,
}

//info : Response wrapper for image data lookup
#[cw_serde]
pub struct ImageResponse {
    pub image: ImageData,
}

//info : Response wrapper for user images lookup
#[cw_serde]
pub struct UserImagesResponse {
    pub images: Vec<String>,
}

//info : Response wrapper for image comments lookup
#[cw_serde]
pub struct ImageCommentsResponse {
    pub comments: Vec<String>,
}

//info : Response wrapper for liked images lookup
#[cw_serde]
pub struct LikedImagesResponse {
    pub liked_images: Vec<String>,
}


//info : Response wrapper for comment data lookup
#[cw_serde] 
pub struct CommentResponse {
    pub comment: ImageComment,
}