import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
    NftBought as NftBoughtEvent,
    NftCanceled as NftCanceledEvent,
    NftListed as NftListedEvent,
} from "../generated/NftMart/NftMart"
import {
    NftBought,
    NftCanceled,
    NftListed,
    ActiveItem,
} from "../generated/schema"

export function handleNftBought(event: NftBoughtEvent): void {
    let entity = new NftBought(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    let activeItemId = getIdFromAddressAndTokenId(
        event.params.nftAddress,
        event.params.tokenId
    )
    let activeItem = ActiveItem.load(activeItemId)

    entity.buyer = event.params.buyer
    entity.nftAddress = event.params.nftAddress
    entity.tokenId = event.params.tokenId
    entity.price = event.params.price

    activeItem!.buyer = event.params.buyer

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
    activeItem!.save()
}

export function handleNftCanceled(event: NftCanceledEvent): void {
    let entity = new NftCanceled(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    let activeItemId = getIdFromAddressAndTokenId(
        event.params.nftAddress,
        event.params.tokenId
    )
    let activeItem = ActiveItem.load(activeItemId)

    entity.seller = event.params.seller
    entity.nftAddress = event.params.nftAddress
    entity.tokenId = event.params.tokenId

    activeItem!.buyer = Address.fromString(
        "0x000000000000000000000000000000000000dEaD" // Cancelled buyer address => 0xdead which is a dead address
    )

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
}

export function handleNftListed(event: NftListedEvent): void {
    let entity = new NftListed(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    let activeItemId = getIdFromAddressAndTokenId(
        event.params.nftAddress,
        event.params.tokenId
    )
    let activeItem = ActiveItem.load(activeItemId)
    if (!activeItem) {
        activeItem = new ActiveItem(activeItemId)
    }

    entity.seller = event.params.seller
    activeItem.seller = event.params.seller

    entity.nftAddress = event.params.nftAddress
    activeItem.nftAddress = event.params.nftAddress

    entity.tokenId = event.params.tokenId
    activeItem.tokenId = event.params.tokenId

    entity.price = event.params.price
    activeItem.price = event.params.price

    activeItem.buyer = Address.fromString(
        "0x0000000000000000000000000000000000000000" // default buyer address => 0x0 which is a zero address
    )

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
    activeItem.save()
}

function getIdFromAddressAndTokenId(address: Address, tokenId: BigInt): string {
    return address.toHex() + "-" + tokenId.toString()
}
