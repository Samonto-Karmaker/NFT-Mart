// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Custom Errors
error PriceMustBeGreaterThanZero();
error NotOwner();
error NotApproved();
error AlreadyListed(address nftAddress, uint256 tokenId);
error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NotListed(address nftAddress, uint256 tokenId);
error TransferFailed();

// Main Contract
contract NftMart is ReentrancyGuard {
    // Structs
    struct Listing {
        uint256 price;
        address seller;
    }

    // Events
    event NftListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event NftBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    // State Variables
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    // Modifiers
    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _spender
    ) {
        if (IERC721(_nftAddress).ownerOf(_tokenId) != _spender) {
            revert NotOwner();
        }
        _;
    }
    modifier isNotListed(address _nftAddress, uint256 _tokenId) {
        if (s_listings[_nftAddress][_tokenId].price > 0) {
            revert AlreadyListed(_nftAddress, _tokenId);
        }
        _;
    }
    modifier isListed(address _nftAddress, uint256 _tokenId) {
        if (s_listings[_nftAddress][_tokenId].price <= 0) {
            revert NotListed(_nftAddress, _tokenId);
        }
        _;
    }

    // Functions

    /**
     * @dev List an NFT for sale.
     * @param _nftAddress The address of the NFT contract.
     * @param _tokenId The ID of the token to list.
     * @param _price The price at which to list the NFT.
     */
    function listNFT(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        isNotListed(_nftAddress, _tokenId)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert PriceMustBeGreaterThanZero();
        }
        if (IERC721(_nftAddress).getApproved(_tokenId) != address(this)) {
            revert NotApproved();
        }
        s_listings[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit NftListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    /**
     * @dev Buts an NFT.
     * @param _nftAddress The address of the NFT contract.
     * @param _tokenId The ID of the token to buy.
     */
    function buyNFT(
        address _nftAddress,
        uint256 _tokenId
    ) external payable nonReentrant isListed(_nftAddress, _tokenId) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];
        if (msg.value < listing.price) {
            revert PriceNotMet(_nftAddress, _tokenId, listing.price);
        }

        s_proceeds[listing.seller] += listing.price;
        delete s_listings[_nftAddress][_tokenId];

        IERC721(_nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            _tokenId
        );
        uint256 excess = msg.value - listing.price;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            if (!success) {
                revert TransferFailed();
            }
        }
        emit NftBought(msg.sender, _nftAddress, _tokenId, listing.price);
    }
}
