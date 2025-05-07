// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Custom Errors
error PriceMustBeGreaterThanZero();
error NotOwner();
error NotApproved();
error AlreadyListed(address nftAddress, uint256 tokenId);

// Main Contract
contract NftMart {

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

    // State Variables
    mapping(address => mapping(uint256 => Listing)) private s_listings;


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
        if (s_listings[_nftAddress][_tokenId].price <= 0) {
            revert AlreadyListed(_nftAddress, _tokenId);
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
}
