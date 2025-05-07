// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error PriceMustBeGreaterThanZero();
error NotOwner();
error NotApproved();
error AlreadyListed(address nftAddress, uint256 tokenId);

contract NftMart {
    struct Listing {
        uint256 price;
        address seller;
    }

    event NftListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;

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
