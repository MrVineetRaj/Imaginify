#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{ to_json_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult};
use cw2::set_contract_version;


use crate::error::ContractError;
use crate::msg::{BuyCreditsMessage, ConfigResponse, CreateCommentMessage, CreateImageMessage, DislikeImageMessage, ExecuteMsg, InstantiateMsg, LikeImageMessage, QueryMsg, RegisterUserMessage, TransactionsResponse, UseCreditsMessage, UserResponse};
use crate::state::{Config, ImageComment, ImageData, Transaction, User, COMMENTS, CONFIG, DISLIKES, IMAGES, IMAGE_COMMENTS, LIKED_IMAGES, LIKES, TRANSACTIONS, USERS, USER_IMAGES};

const CONTRACT_NAME: &str = "crates.io:imaginify";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    // Validate admin address from message or default to sender
    let admin_addr = msg.admin.map_or(info.sender.clone(), |addr| {
         deps.api.addr_validate(&addr).unwrap_or(info.sender.clone())
    });

    // Initialize contract configuration with admin address
    let config = Config {
        admin: admin_addr,
    };

    // Set contract version for migration purposes
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    // Store configuration in contract storage
    CONFIG.save(deps.storage, &config)?;

    // Return successful response with initialization metadata
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", info.sender)
    )
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    // Route execution to appropriate handler based on message type
    match msg {
        ExecuteMsg::RegisterUser(msg) => execute_register_user(deps, env, info, msg),
        ExecuteMsg::BuyCredits(msg) => execute_buy_credits(deps, env, info, msg),
        ExecuteMsg::UseCredits(msg) => execute_use_credits(deps, env, info, msg),
        ExecuteMsg::CreateImage(msg) => execute_create_image(deps, env, info, msg),
        ExecuteMsg::LikeImage(msg) => execute_like_image(deps, env, info, msg),
        ExecuteMsg::DislikeImage(msg) => execute_dislike_image(deps, env, info, msg),
        ExecuteMsg::CreateComment(msg) => execute_create_comment(deps, env, info, msg),
        ExecuteMsg::WithdrawMoney {} => {
            // Get the current configuration to check admin privileges
            let config = CONFIG.load(deps.storage)?;
            
            // Only the admin should be able to withdraw funds
            if info.sender != config.admin {
                return Err(ContractError::Unauthorized {});
            }
            
            // Get the current contract balance
            let contract_balance = deps.querier.query_all_balances(&env.contract.address)?;
            
            if contract_balance.is_empty() {
                return Err(ContractError::InsufficientAmount {});
            }
            
            // Create a message to send all funds to the admin
            let bank_msg = cosmwasm_std::BankMsg::Send {
                to_address: config.admin.to_string(),
                amount: contract_balance.clone(),
            };
            
            // Create the response with the bank message and add attributes
            let response = Response::new()
                .add_message(bank_msg)
                .add_attribute("action", "withdraw_money")
                .add_attribute("recipient", config.admin.to_string())
                .add_attribute("amount", format!("{:?}", contract_balance));
            
            Ok(response)
        }
        // ExecuteMsg::LikeComment(msg) => execute_like_comment(deps, env, info, msg),
        // ExecuteMsg::DislikeComment(msg) => execute_dislike_comment(deps, env, info, msg),
    }
}

pub fn execute_register_user(
    deps: DepsMut,
    _env: Env,
    info:MessageInfo,
    _msg: RegisterUserMessage,
) -> Result<Response, ContractError> {
    let user_addr = info.sender.clone();
    if USERS.has(deps.storage, &user_addr) {
        return Err(ContractError::UserExists {});
    }

    let new_user = User {
        credit_balance: 10,
    };

    USERS.save(deps.storage, &user_addr, &new_user)?;

    Ok(Response::new()
        .add_attribute("action", "register_teacher")
        .add_attribute("teacher", user_addr.to_string()))
}


pub fn execute_buy_credits(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: BuyCreditsMessage
) -> Result<Response, ContractError> 
{

    let buyer_addr = info.sender.clone();
    
    let credits_to_be_added: u128;
    
    let mut user = USERS.load(deps.storage, &buyer_addr)
        .map_err(|_| ContractError::UserNotFound {})?;


    if msg.bundle == "NovaBurst" {
        credits_to_be_added = 10;
        let amount_required = 0.01;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() != required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    
    else if msg.bundle == "PixelPower" {
        credits_to_be_added = 25;
        let amount_required = 0.02;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() !=  required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    else if msg.bundle == "DreamForge" {
        credits_to_be_added = 60;
        let amount_required = 0.04;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() !=  required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    } else if msg.bundle == "VisionVault" {
        credits_to_be_added = 150;
        let amount_required = 0.08;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() !=  required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }else if msg.bundle == "CreatorSphere" {
        credits_to_be_added = 200;
        let amount_required = 0.1;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() !=  required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }else if msg.bundle == "InfinityCanvas" {
        credits_to_be_added = 300;
        let amount_required = 0.15;
        
        let payment = info.funds
            .iter()
            .find(|coin| coin.denom == "uxion") 
            .ok_or_else(|| ContractError::InsufficientAmount {})?;

        let required_amount = (amount_required * 1_000_000.0) as u128;
        
        if payment.amount.u128() !=  required_amount {
            return Err(ContractError::InsufficientAmount {});
        }
    }
    else {
        return Err(ContractError::InvalidAmount {});
    }

    user.credit_balance += credits_to_be_added;
    USERS.save(deps.storage, &buyer_addr, &user)?;
    
    let new_transaction = Transaction {
        credits: credits_to_be_added,
        label: String::from("BOUGHT"),
        timestamp: env.block.time.seconds() as u128,
        amount_used: 0,
    };
    
    let transactions = TRANSACTIONS.may_load(deps.storage, &buyer_addr)?.unwrap_or_default();

    let mut updated_transactions = transactions;
    updated_transactions.push(new_transaction);

    TRANSACTIONS.save(deps.storage, &buyer_addr, &updated_transactions)?;




    Ok(Response::new()
        .add_attribute("action", "buy_credits")
        .add_attribute("credits", user.credit_balance.to_string())
        .add_attribute("buyer", buyer_addr.to_string()))
}

pub fn execute_use_credits(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: UseCreditsMessage
) -> Result<Response, ContractError> 
{
    let credit_user_addr = info.sender.clone();



    let mut user = USERS.load(deps.storage, &credit_user_addr)
        .map_err(|_| ContractError::UserNotFound {})?;

    if user.credit_balance < msg.credits  {
        return Err(ContractError::InsufficientCredits {});
    }

    user.credit_balance -= msg.credits;

    USERS.save(deps.storage, &credit_user_addr, &user)?;

    let new_transaction = Transaction {
        credits: msg.credits,
        label: String::from("USED"),
        timestamp: env.block.time.seconds() as u128,
        amount_used: 0,
    };
    
    let transactions = TRANSACTIONS.may_load(deps.storage, &credit_user_addr)?.unwrap_or_default();

    let mut updated_transactions = transactions;
    updated_transactions.push(new_transaction);

    TRANSACTIONS.save(deps.storage, &credit_user_addr, &updated_transactions)?;

    Ok(Response::new()
        .add_attribute("action", "buy_credits")
        .add_attribute("credits", msg.credits.to_string())
        .add_attribute("credit user", credit_user_addr.to_string()))
}

pub fn execute_create_image(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: CreateImageMessage
) -> Result<Response, ContractError> 
{
    let image_id = msg.image_id.clone();
    let author = msg.author.clone();
    let original_image_url = msg.original_image_url.clone();
    let edited_image_url = msg.edited_image_url.clone();
    let title = msg.title.clone();
    let prompt = msg.prompt.clone();

    let new_image = ImageData {
        image_id: image_id.clone(),
        author: author.clone(),
        original_image_url: original_image_url.clone(),
        edited_image_url: edited_image_url.clone(),
        title: title.clone(),
        prompt: prompt.clone(),
        like_count: 0,
        dislike_count: 0,
    };


    IMAGES.save(deps.storage, image_id.clone(), &new_image)?;

    USER_IMAGES.update(deps.storage, &author, |images| -> StdResult<Vec<String>> {
    let mut images = images.unwrap_or_default();
    images.push(image_id.to_string());
    Ok(images)
}

)?;
    Ok(Response::new()
        .add_attribute("action", "create_images")
        .add_attribute("image", image_id.to_string())
)
}


pub fn execute_like_image(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: LikeImageMessage
) -> Result<Response, ContractError> 
{
    let image_id = msg.image_id.clone();
    let user = info.sender.clone();
    
    let mut image = IMAGES.load(deps.storage, image_id.clone())
        .map_err(|_| ContractError::ImageNotFound {})?;
    // Check if user already liked this image
    let likes = LIKES.may_load(deps.storage, image_id.clone())?.unwrap_or_default();
    if likes.contains(&user) {
        return Err(ContractError::ImageAlreadyLiked {});
    }

    // Check if user already disliked this image
    let dislikes = DISLIKES.may_load(deps.storage, image_id.clone())?.unwrap_or_default();
    if dislikes.contains(&user) {
        return Err(ContractError::ImageAlreadyDisliked {});
    }
    image.like_count += 1;

    IMAGES.save(deps.storage, image_id.clone(), &image)?;

    LIKED_IMAGES.update(deps.storage, &info.sender, |liked_images| -> StdResult<Vec<String>> {
        let mut liked_images = liked_images.unwrap_or_default();
        liked_images.push(image_id.clone());
        Ok(liked_images)
    })?;

    LIKES.update(deps.storage, image_id.clone(), |likes| -> StdResult<Vec<Addr>> {
        let mut likes = likes.unwrap_or_default();
        likes.push(info.sender.clone());
        Ok(likes)
    })?;

    Ok(Response::new()
        .add_attribute("action", "like_image")
        .add_attribute("image_id", image_id.to_string()))

}


pub fn execute_dislike_image(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: DislikeImageMessage
) -> Result<Response, ContractError> 
{
    let image_id = msg.image_id.clone();
    let user = info.sender.clone();
    

    let mut image = IMAGES.load(deps.storage, image_id.clone())
        .map_err(|_| ContractError::ImageNotFound {})?;

     // Check if user already liked this image
    let likes = LIKES.may_load(deps.storage, image_id.clone())?.unwrap_or_default();
    if likes.contains(&user) {
        return Err(ContractError::ImageAlreadyLiked  {});
    }

    // Check if user already disliked this image
    let dislikes = DISLIKES.may_load(deps.storage, image_id.clone())?.unwrap_or_default();
    if dislikes.contains(&user) {
        return Err(ContractError::ImageAlreadyDisliked {});
    }


    image.dislike_count += 1;

    IMAGES.save(deps.storage, image_id.clone(), &image)?;
    DISLIKES.update(deps.storage, image_id.clone(), |dislikes| -> StdResult<Vec<Addr>> {
        let mut dislikes = dislikes.unwrap_or_default();
        dislikes.push(info.sender.clone());
        Ok(dislikes)
    })?;

    Ok(Response::new()
        .add_attribute("action", "dislike_image")
        .add_attribute("image_id", image_id.to_string()))

}

pub fn execute_create_comment(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: CreateCommentMessage
) -> Result<Response, ContractError> 
{
    let comment_id = msg.comment_id.clone();
    let image_id = msg.image_id.clone();
    let author = msg.author.clone();
    let comment = msg.comment.clone();
    let timestamp = msg.timestamp.clone();

    // Check if image exists to avoid orphaned comments
    if !IMAGES.has(deps.storage, image_id.clone()) {
        return Err(ContractError::ImageNotFound {});
    }

        let new_comment = ImageComment {
        comment_id: comment_id.clone(),
        image_id: image_id.clone(),
        author: author.clone(),
        comment: comment.clone(),
        timestamp: timestamp.clone(),
    };

    COMMENTS.save(deps.storage, comment_id.clone(), &new_comment)?;

    // Fix the bug in IMAGE_COMMENTS - we're storing comment_id not image_id
    IMAGE_COMMENTS.update(deps.storage, image_id.clone(), |comments| -> StdResult<Vec<String>> {
        let mut comments = comments.unwrap_or_default();
        comments.push(comment_id.to_string()); // Fix: store comment_id, not image_id
        Ok(comments)
    })?;

    Ok(Response::new()
        .add_attribute("action", "create_comment")
        .add_attribute("comment_id", comment_id.to_string())
        .add_attribute("image_id", image_id.to_string())
    )
}



















#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetConfig {} => query_config(deps),
        QueryMsg::GetUser { address } => query_user(deps, address),
        QueryMsg::GetTransactions { address } => query_transactions(deps, address),
        QueryMsg::GetImage { image_id } => query_image(deps, image_id),
        QueryMsg::GetImages {} => query_images(deps),
        QueryMsg::GetUserImages { address } => query_user_images(deps, address),
        QueryMsg::GetImageComments { image_id } => query_image_comments(deps, image_id),
        QueryMsg::GetLikedImages { address } => query_liked_images(deps, address),
        QueryMsg::GetComment { comment_id } => query_comment(deps, comment_id),
    }
}
fn query_config(deps: Deps) -> StdResult<Binary> {
    let config = CONFIG.load(deps.storage)?;
    to_json_binary(&ConfigResponse { config })
}


// Fix user query to handle non-existent users
fn query_user(deps: Deps, address: Addr) -> StdResult<Binary> {
    let user_data = match USERS.may_load(deps.storage, &address)? {
        Some(user) => UserResponse { 
            user, 
            is_registered: true 
        },
        None => UserResponse { 
            user: User { credit_balance: 0 }, 
            is_registered: false 
        },
    };
    to_json_binary(&user_data)
}

fn query_transactions(deps: Deps, address: Addr) -> StdResult<Binary> {
    let transactions = match TRANSACTIONS.may_load(deps.storage, &address)?{
        Some(transactions) => transactions,
        None => Vec::new(), // Return empty list if no transactions exist
    };
    to_json_binary(&TransactionsResponse { transactions })
}

fn query_images(deps: Deps) -> StdResult<Binary> {
    let image_ids = IMAGES.keys(
        deps.storage, 
        None, 
        None, 
        cosmwasm_std::Order::Ascending
    ).collect::<StdResult<Vec<String>>>()?;
    
    // Option 1: Return just the IDs
    to_json_binary(&image_ids)
    
}

fn query_image(deps: Deps, image_id: String) -> StdResult<Binary> {
    let image: ImageData = IMAGES.load(deps.storage, image_id)?;
    to_json_binary(&image)
}
fn query_user_images(deps: Deps, address: Addr) -> StdResult<Binary> {
    let images: Vec<String> = match USER_IMAGES.may_load(deps.storage, &address)?{
        Some(images) => images,
        None => Vec::new(), // Return empty list if no images exist
    };
    to_json_binary(&images)
}

// Also fix the query_image_comments function
fn query_image_comments(deps: Deps, image_id: String) -> StdResult<Binary> {
    // Get comment IDs for the image
    let comment_ids: Vec<String> = match IMAGE_COMMENTS.may_load(deps.storage, image_id.clone())? {
        Some(ids) => ids,
        None => Vec::new(), // Return empty list if no comments exist
    };
    
    to_json_binary(&comment_ids)
}

// Fix the liked_images query to handle non-existent entries
fn query_liked_images(deps: Deps, address: Addr) -> StdResult<Binary> {
    let liked_images = match LIKED_IMAGES.may_load(deps.storage, &address)? {
        Some(images) => images,
        None => Vec::new(), // Return empty list if no liked images exist
    };
    to_json_binary(&liked_images)
}

fn query_comment(deps: Deps, comment_id: String) -> StdResult<Binary> {
    let comment:ImageComment  = COMMENTS.load(deps.storage, comment_id)?;
    to_json_binary(&comment)
}