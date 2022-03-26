pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    string public constant name = "Star Notary Token";
    string public constant symbol = "SNT";
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        // extract the price of the star
        uint256 starPrice = starsForSale[_tokenId];

        // checking to see if the star has a price
        require(starPrice > 0, "The star has a price of 0 or less");

        address ownerAddress = ownerOf(_tokenId);
        // check to see if the sender has enough ether to make the purchase
        require(msg.value > starPrice, "You don't have enough ether");

        // send the token from the owner the purchaser
        _transferFrom(ownerAddress, msg.sender, _tokenId);

        // we need to make the address payable so that we can take advantage of 
        // the methods transfer, send, etc.
        address payable ownerAddressPayable = _make_payable(ownerAddress);

        // transfer ether to the owner
        ownerAddressPayable.transfer(starPrice);
        
        // if there is any left over, then we send it pack to the sender
        if(msg.value > starPrice) {
            msg.sender.transfer(msg.value - starPrice);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint256 _tokenId) public view returns (string memory starName) {
        // get the star name from the mapping
        starName = tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        // creating variables to hold the owners of the token as not to look up later on.
        address token1OwnerAddress = ownerOf(_tokenId1);
        address token2OwnerAddress = ownerOf(_tokenId2);

        // checking to see if the sender owns either token.
        require(msg.sender == token1OwnerAddress  ||  msg.sender == token2OwnerAddress, "The sender doesn't own either token");     

        // transfering the tokens from one address to the other   
        _transferFrom(token1OwnerAddress, token2OwnerAddress, _tokenId1);
        _transferFrom(token2OwnerAddress, token1OwnerAddress, _tokenId2);

    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        address tokenOwnerAddress = ownerOf(_tokenId);
        
        // checking to see if the sender owns the token
        require(msg.sender == tokenOwnerAddress, "The sender doesn't own the token");     

        // transfering the star from one address to another
        transferFrom(tokenOwnerAddress, _to1, _tokenId);
    }
}
