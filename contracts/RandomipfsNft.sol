// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice Errors
 */
error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransactionFailed();

contract RandomipfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    /** @dev The state That determines the Nft to be Created  */
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    string[] internal s_dogTokenURIS;
    uint256 internal immutable i_mintFee;
    //VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    //NFT Variables
    uint256 public s_tokenCounter;
    uint256 constant MAX_CHANCE_VALUE = 100;

    //events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenURIS,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random Ipfs Nft", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenURIS = dogTokenURIS;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    /// @notice Explain to an end user what this does
    /// @dev  1.This returns a random number from the ChainLinkVrf
    //        2. The random number is used to get the chance of a type of nft appearing
    //         3. The Nft is created uses this Logic
    //             * randomWords[0] % MAX_CHANCE_VALUE
    //            * if it returns 0-10 a  PUG
    //           * if it returns 11-30 a  Shiba Inu
    //          * if it returns  31 - 99  a  ST.Bernard

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter += 1;
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURIS[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cummulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cummulativeSum &&
                moddedRng < cummulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }

            cummulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withDraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransactionFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getTokenURIS(uint256 index) public view returns (string memory) {
        return s_dogTokenURIS[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
