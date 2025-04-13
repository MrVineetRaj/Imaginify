use crate::contract::{execute, instantiate, query};
use crate::error::ContractError;
use crate::msg::{
    BuyCreditsMessage, ConfigResponse, CreateCommentMessage, CreateImageMessage, DislikeImageMessage,
    ExecuteMsg, InstantiateMsg,
    LikeImageMessage, QueryMsg, RegisterUserMessage, TransactionsResponse,
    UseCreditsMessage, UserResponse,
};
use crate::state::ImageData;
use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
use cosmwasm_std::{from_json, Addr, Coin, Uint128};

// Helper function for instantiating the contract for tests
fn setup_contract(deps: &mut cosmwasm_std::OwnedDeps<cosmwasm_std::MemoryStorage, cosmwasm_std::testing::MockApi, cosmwasm_std::testing::MockQuerier>) -> Addr {
    let msg = InstantiateMsg { admin: None };
    let info = mock_info("creator", &[]);
    let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());
    Addr::unchecked("creator")
}

#[test]
fn proper_initialization() {
    let mut deps = mock_dependencies();
    let admin = setup_contract(&mut deps);
    
    // Query the config to verify it was set correctly
    let config: ConfigResponse =
        from_json(query(deps.as_ref(), mock_env(), QueryMsg::GetConfig {}).unwrap()).unwrap();
    assert_eq!(admin, config.config.admin);
}

#[test]
fn test_instantiate_with_custom_admin() {
    let mut deps = mock_dependencies();
    let msg = InstantiateMsg {
        admin: Some("custom_admin".to_string()),
    };
    let info = mock_info("creator", &[]);
    let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(0, res.messages.len());
    
    // Query the config to verify custom admin was set
    let config: ConfigResponse =
        from_json(query(deps.as_ref(), mock_env(), QueryMsg::GetConfig {}).unwrap()).unwrap();
    assert_eq!(Addr::unchecked("custom_admin"), config.config.admin);
}

#[test]
fn register_user() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Register a new user
    let info = mock_info("user1", &[]);
    let msg = ExecuteMsg::RegisterUser(RegisterUserMessage {});
    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(2, res.attributes.len());
    
    // Verify the user was registered with initial credits
    let user: UserResponse = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetUser {
                address: Addr::unchecked("user1"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    assert_eq!(10, user.user.credit_balance);
    
    // Attempt to register the same user again (should fail)
    let info = mock_info("user1", &[]);
    let msg = ExecuteMsg::RegisterUser(RegisterUserMessage {});
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::UserExists {} => {}
        _ => panic!("Expected UserExists error"),
    }
}

#[test]
fn buy_credits() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Register a user first
    let info = mock_info("buyer", &[]);
    let msg = ExecuteMsg::RegisterUser(RegisterUserMessage {});
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Test all credit bundle options
    let bundles = [
        ("NovaBurst", 10, 10_000u128), // 0.01 XION = 10,000 uxion
        ("PixelPower", 25, 20_000u128), // 0.02 XION
        ("DreamForge", 60, 40_000u128), // 0.04 XION
        ("VisionVault", 150, 80_000u128), // 0.08 XION
        ("CreatorSphere", 200, 100_000u128), // 0.1 XION
        ("InfinityCanvas", 300, 150_000u128), // 0.15 XION
    ];
    
    for (bundle, credits, required_payment) in bundles {
        // Buy credits with sufficient funds
        let info = mock_info("buyer", &[Coin {
            denom: "uxion".to_string(),
            amount: Uint128::from(required_payment),
        }]);
        let msg = ExecuteMsg::BuyCredits(BuyCreditsMessage {
            bundle: bundle.to_string(),
        });
        
        let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
        assert_eq!(3, res.attributes.len());
        
        // Query user to verify credits were added
        let _user: UserResponse = from_json(
            query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::GetUser {
                    address: Addr::unchecked("buyer"),
                },
            )
            .unwrap(),
        )
        .unwrap();
        
        // Check transactions were recorded
        let transactions: TransactionsResponse = from_json(
            query(
                deps.as_ref(),
                mock_env(),
                QueryMsg::GetTransactions {
                    address: Addr::unchecked("buyer"),
                },
            )
            .unwrap(),
        )
        .unwrap();
        
        assert!(!transactions.transactions.is_empty());
        let latest_tx = transactions.transactions.last().unwrap();
        assert_eq!("BOUGHT", latest_tx.label);
        assert_eq!(credits, latest_tx.credits);
    }
    
    // Test insufficient funds
    let info = mock_info("buyer", &[Coin {
        denom: "uxion".to_string(),
        amount: Uint128::from(5_000u128), // Less than required for any bundle
    }]);
    let msg = ExecuteMsg::BuyCredits(BuyCreditsMessage {
        bundle: "NovaBurst".to_string(),
    });
    
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::InsufficientAmount {} => {}
        _ => panic!("Expected InsufficientAmount error"),
    }
    
    // Test invalid bundle
    let info = mock_info("buyer", &[Coin {
        denom: "uxion".to_string(),
        amount: Uint128::from(100_000u128),
    }]);
    let msg = ExecuteMsg::BuyCredits(BuyCreditsMessage {
        bundle: "NonExistentBundle".to_string(),
    });
    
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::InvalidAmount {} => {}
        _ => panic!("Expected InvalidAmount error"),
    }
    
    // Test wrong token
    let info = mock_info("buyer", &[Coin {
        denom: "uatom".to_string(), // Wrong token
        amount: Uint128::from(100_000u128),
    }]);
    let msg = ExecuteMsg::BuyCredits(BuyCreditsMessage {
        bundle: "NovaBurst".to_string(),
    });
    
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::InsufficientAmount {} => {}
        _ => panic!("Expected InsufficientAmount error"),
    }
}

#[test]
fn use_credits() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Register a user first
    let info = mock_info("user1", &[]);
    let msg = ExecuteMsg::RegisterUser(RegisterUserMessage {});
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Use 5 credits
    let info = mock_info("user1", &[]);
    let msg = ExecuteMsg::UseCredits(UseCreditsMessage { credits: 5 });
    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(3, res.attributes.len());
    
    // Verify credits were deducted
    let user: UserResponse = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetUser {
                address: Addr::unchecked("user1"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    assert_eq!(5, user.user.credit_balance); // Started with 10, used 5
    
    // Check transactions were recorded
    let transactions: TransactionsResponse = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetTransactions {
                address: Addr::unchecked("user1"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert_eq!(1, transactions.transactions.len());
    let tx = &transactions.transactions[0];
    assert_eq!("USED", tx.label);
    assert_eq!(5, tx.credits);
    
    // Try to use more credits than available
    let info = mock_info("user1", &[]);
    let msg = ExecuteMsg::UseCredits(UseCreditsMessage { credits: 10 });
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::InsufficientCredits {} => {}
        _ => panic!("Expected InsufficientCredits error"),
    }
    
    // Try to use credits with a non-existent user
    let info = mock_info("nonexistent", &[]);
    let msg = ExecuteMsg::UseCredits(UseCreditsMessage { credits: 1 });
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::UserNotFound {} => {}
        _ => panic!("Expected UserNotFound error"),
    }
}

#[test]
fn create_image() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Create an image
    let info = mock_info("author", &[]);
    let msg = ExecuteMsg::CreateImage(CreateImageMessage {
        image_id: "img1".to_string(),
        author: Addr::unchecked("author"),
        original_image_url: "original.jpg".to_string(),
        edited_image_url: "edited.jpg".to_string(),
        title: "Test Image".to_string(),
        prompt: "A test prompt".to_string(),
    });
    
    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(2, res.attributes.len());
    
    // Query the image
    let image: ImageData = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetImage {
                image_id: "img1".to_string(),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert_eq!("img1", image.image_id);
    assert_eq!(Addr::unchecked("author"), image.author);
    assert_eq!("original.jpg", image.original_image_url);
    assert_eq!("edited.jpg", image.edited_image_url);
    assert_eq!("Test Image", image.title);
    assert_eq!("A test prompt", image.prompt);
    assert_eq!(0, image.like_count);
    assert_eq!(0, image.dislike_count);
    
    // Get user's images
    let images: Vec<String> = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetUserImages {
                address: Addr::unchecked("author"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert_eq!(1, images.len());
    assert_eq!("img1", images[0]);
    
    // Get all images
    let all_images: Vec<String> = from_json(
        query(deps.as_ref(), mock_env(), QueryMsg::GetImages {}).unwrap(),
    )
    .unwrap();
    
    assert_eq!(1, all_images.len());
    assert_eq!("img1", all_images[0]);
}

#[test]
fn like_dislike_image() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Create an image first
    let info = mock_info("author", &[]);
    let msg = ExecuteMsg::CreateImage(CreateImageMessage {
        image_id: "img1".to_string(),
        author: Addr::unchecked("author"),
        original_image_url: "original.jpg".to_string(),
        edited_image_url: "edited.jpg".to_string(),
        title: "Test Image".to_string(),
        prompt: "A test prompt".to_string(),
    });
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Like the image
    let info = mock_info("liker", &[]);
    let msg = ExecuteMsg::LikeImage(LikeImageMessage {
        image_id: "img1".to_string(),
    });
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Verify like count increased
    let image: ImageData = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetImage {
                image_id: "img1".to_string(),
            },
        )
        .unwrap(),
    )
    .unwrap();
    assert_eq!(1, image.like_count);
    assert_eq!(0, image.dislike_count);
    
    // Dislike the image
    let info = mock_info("disliker", &[]);
    let msg = ExecuteMsg::DislikeImage(DislikeImageMessage {
        image_id: "img1".to_string(),
    });
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Verify dislike count increased
    let image: ImageData = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetImage {
                image_id: "img1".to_string(),
            },
        )
        .unwrap(),
    )
    .unwrap();
    assert_eq!(1, image.like_count);
    assert_eq!(1, image.dislike_count);
    
    // Try to like a non-existent image
    let info = mock_info("liker", &[]);
    let msg = ExecuteMsg::LikeImage(LikeImageMessage {
        image_id: "nonexistent".to_string(),
    });
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::ImageNotFound {} => {}
        _ => panic!("Expected ImageNotFound error"),
    }
    
    // Try to dislike a non-existent image
    let info = mock_info("disliker", &[]);
    let msg = ExecuteMsg::DislikeImage(DislikeImageMessage {
        image_id: "nonexistent".to_string(),
    });
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::ImageNotFound {} => {}
        _ => panic!("Expected ImageNotFound error"),
    }
}

#[test]
fn create_comment() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Create an image first
    let info = mock_info("author", &[]);
    let msg = ExecuteMsg::CreateImage(CreateImageMessage {
        image_id: "img1".to_string(),
        author: Addr::unchecked("author"),
        original_image_url: "original.jpg".to_string(),
        edited_image_url: "edited.jpg".to_string(),
        title: "Test Image".to_string(),
        prompt: "A test prompt".to_string(),
    });
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Create a comment
    let info = mock_info("commenter", &[]);
    let msg = ExecuteMsg::CreateComment(CreateCommentMessage {
        comment_id: "comment1".to_string(),
        image_id: "img1".to_string(),
        author: Addr::unchecked("commenter"),
        comment: "Great image!".to_string(),
        timestamp:  String::from("1234567890"),
    });
    let res = execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    assert_eq!(3, res.attributes.len());
    
    // Query comments for the image
    let comments: Vec<String> = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetImageComments {
                image_id: "img1".to_string(),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert_eq!(1, comments.len());
    assert_eq!("comment1", comments[0]);
    
    // Try to comment on a non-existent image
    let info = mock_info("commenter", &[]);
    let msg = ExecuteMsg::CreateComment(CreateCommentMessage {
        comment_id: "comment2".to_string(),
        image_id: "nonexistent".to_string(),
        author: Addr::unchecked("commenter"),
        comment: "This image doesn't exist".to_string(),
        timestamp: String::from("1234567890"),
    });
    let err = execute(deps.as_mut(), mock_env(), info, msg).unwrap_err();
    match err {
        ContractError::ImageNotFound {} => {}
        _ => panic!("Expected ImageNotFound error"),
    }
}

#[test]
fn query_non_existent_user() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Query a non-existent user
    let user: UserResponse = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetUser {
                address: Addr::unchecked("nonexistent"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    // Should return default user with 0 credit balance
    assert_eq!(0, user.user.credit_balance);
}

#[test]
fn query_empty_transactions() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Query transactions for a user who has none
    let transactions: TransactionsResponse = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetTransactions {
                address: Addr::unchecked("nonexistent"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert!(transactions.transactions.is_empty());
}

#[test]
fn query_empty_user_images() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Query images for a user who has none
    let images: Vec<String> = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetUserImages {
                address: Addr::unchecked("nonexistent"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert!(images.is_empty());
}

#[test]
fn query_empty_image_comments() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Create an image first to avoid ImageNotFound error
    let info = mock_info("author", &[]);
    let msg = ExecuteMsg::CreateImage(CreateImageMessage {
        image_id: "img1".to_string(),
        author: Addr::unchecked("author"),
        original_image_url: "original.jpg".to_string(),
        edited_image_url: "edited.jpg".to_string(),
        title: "Test Image".to_string(),
        prompt: "A test prompt".to_string(),
    });
    execute(deps.as_mut(), mock_env(), info, msg).unwrap();
    
    // Query comments for an image that has none
    let comments: Vec<String> = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetImageComments {
                image_id: "img1".to_string(),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert!(comments.is_empty());
}

#[test]
fn query_empty_liked_images() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Query liked images for a user who has none
    let liked_images: Vec<String> = from_json(
        query(
            deps.as_ref(),
            mock_env(),
            QueryMsg::GetLikedImages {
                address: Addr::unchecked("nonexistent"),
            },
        )
        .unwrap(),
    )
    .unwrap();
    
    assert!(liked_images.is_empty());
}

#[test]
fn query_empty_images() {
    let mut deps = mock_dependencies();
    setup_contract(&mut deps);
    
    // Query all images when none exist
    let images: Vec<String> = from_json(
        query(deps.as_ref(), mock_env(), QueryMsg::GetImages {}).unwrap(),
    )
    .unwrap();
    
    assert!(images.is_empty());
}
