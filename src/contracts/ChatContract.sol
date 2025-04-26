// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./TokenContract.sol";

contract ChatContract {
    struct User {
        string name;
        address userAddress;
        bool exists;
    }
    
    struct Message {
        address sender;
        address receiver;
        string content;
        uint256 timestamp;
    }
    
    // Token contract reference
    TokenContract public token;
    
    // Owner of the contract
    address public owner;
    
    // Mapping from address to User
    mapping(address => User) private users;
    
    // Array of all user addresses
    address[] private userAddresses;
    
    // Mapping from user address to their friends' addresses
    mapping(address => address[]) private friends;
    
    // Mapping to check if two users are friends
    mapping(address => mapping(address => bool)) private isFriend;
    
    // Mapping to store messages between two users
    mapping(address => mapping(address => Message[])) private messages;
    
    // Events
    event UserRegistered(address indexed userAddress, string name);
    event FriendAdded(address indexed user, address indexed friend);
    event MessageSent(address indexed from, address indexed to, string content, uint256 timestamp);
    event TokensSent(address indexed from, address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _tokenAddress) {
        token = TokenContract(_tokenAddress);
        owner = msg.sender;
    }
    
    // Transfer ownership of the contract to a new account
    function transferOwnership(address newOwner) public {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    // Register a new user
    function registerUser(string memory _name) public {
        require(!users[msg.sender].exists, "User already registered");
        
        users[msg.sender] = User({
            name: _name,
            userAddress: msg.sender,
            exists: true
        });
        
        userAddresses.push(msg.sender);

        token.requestTokens(msg.sender, 100 * 10**18); // 100 tokens
        
        emit UserRegistered(msg.sender, _name);
    }
    
    // Get user by address
    function getUserByAddress(address _userAddress) public view returns (User memory) {
        require(users[_userAddress].exists, "User does not exist");
        return users[_userAddress];
    }
    
    // Get all users
    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](userAddresses.length);
        
        for (uint i = 0; i < userAddresses.length; i++) {
            allUsers[i] = users[userAddresses[i]];
        }
        
        return allUsers;
    }
    
    // Add a friend
    function addFriend(address _friendAddress) public {
        require(users[msg.sender].exists, "User not registered");
        require(users[_friendAddress].exists, "Friend not registered");
        require(msg.sender != _friendAddress, "Cannot add yourself as a friend");
        require(!isFriend[msg.sender][_friendAddress], "Already friends");
        
        friends[msg.sender].push(_friendAddress);
        isFriend[msg.sender][_friendAddress] = true;
        
        emit FriendAdded(msg.sender, _friendAddress);
    }
    
    // Get friends
    function getFriends() public view returns (User[] memory) {
        require(users[msg.sender].exists, "User not registered");
        
        address[] memory friendAddresses = friends[msg.sender];
        User[] memory friendUsers = new User[](friendAddresses.length);
        
        for (uint i = 0; i < friendAddresses.length; i++) {
            friendUsers[i] = users[friendAddresses[i]];
        }
        
        return friendUsers;
    }
    
    // Send a message
    function sendMessage(address _to, string memory _content) public {
        require(users[msg.sender].exists, "Sender not registered");
        require(users[_to].exists, "Receiver not registered");
        
        // Create the message
        Message memory newMessage = Message({
            sender: msg.sender,
            receiver: _to,
            content: _content,
            timestamp: block.timestamp
        });
        
        // Store the message in both users' message history
        messages[msg.sender][_to].push(newMessage);
        messages[_to][msg.sender].push(newMessage);
        
        // Charge a small token fee for sending messages
        token.transferFrom(msg.sender, address(this), 1 * 10**16); // 0.01 tokens
        
        emit MessageSent(msg.sender, _to, _content, block.timestamp);
    }
    
    // Get messages between current user and another user
    function getMessages(address _otherUser) public view returns (Message[] memory) {
        require(users[msg.sender].exists, "User not registered");
        require(users[_otherUser].exists, "Other user not registered");
        
        return messages[msg.sender][_otherUser];
    }
    
    // Check if a user is registered
    function isRegistered(address _userAddress) public view returns (bool) {
        return users[_userAddress].exists;
    }
    
    // Check if two users are friends
    function checkFriendship(address _user1, address _user2) public view returns (bool) {
        return isFriend[_user1][_user2];
    }
    
    // Send tokens to a friend
    function sendTokensToFriend(address _friendAddress, uint256 _amount) public returns (bool) {
        require(users[msg.sender].exists, "Sender not registered");
        require(users[_friendAddress].exists, "Receiver not registered");
        require(isFriend[msg.sender][_friendAddress], "You can only send tokens to friends");
        require(_amount > 0, "Amount must be greater than 0");
        
        // First, check if sender has enough tokens
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient token balance");
        
        // Transfer tokens from sender to friend
        bool success = token.transferFrom(msg.sender, _friendAddress, _amount);
        require(success, "Token transfer failed");
        
        // Create a system message about the token transfer
        string memory content = string(abi.encodePacked(
            "SYSTEM: ", 
            users[msg.sender].name, 
            " sent ", 
            _formatTokenAmount(_amount), 
            " CHAT tokens"
        ));
        
        // Create the message
        Message memory newMessage = Message({
            sender: address(this),  // System message
            receiver: _friendAddress,
            content: content,
            timestamp: block.timestamp
        });
        
        // Store the message in both users' message history
        messages[msg.sender][_friendAddress].push(newMessage);
        messages[_friendAddress][msg.sender].push(newMessage);
        
        emit TokensSent(msg.sender, _friendAddress, _amount);
        emit MessageSent(address(this), _friendAddress, content, block.timestamp);
        
        return true;
    }
    
    // Admin function to withdraw tokens from the contract (fees collected from message sending)
    function withdrawTokens(address _to, uint256 _amount) public onlyOwner {
        uint256 contractBalance = token.balanceOf(address(this));
        require(_amount <= contractBalance, "Insufficient contract balance");
        
        bool success = token.transfer(_to, _amount);
        require(success, "Token transfer failed");
    }
    
    // Helper function to format token amount (convert from wei to ether format)
    function _formatTokenAmount(uint256 _amount) internal pure returns (string memory) {
        // Convert to a decimal string with 18 decimals
        uint256 whole = _amount / 10**18;
        uint256 fraction = _amount % 10**18;
        
        // Convert whole part to string
        string memory wholeStr = _uintToString(whole);
        
        // If there's no fraction, return just the whole part
        if (fraction == 0) {
            return wholeStr;
        }
        
        // Convert fraction to string and ensure it has 18 digits by adding leading zeros
        string memory fractionStr = _uintToString(fraction);
        uint256 fractionLength = _strlen(fractionStr);
        uint256 zerosToAdd = 18 - fractionLength;
        
        string memory result = wholeStr;
        result = string(abi.encodePacked(result, "."));
        
        // Add leading zeros if needed
        for (uint256 i = 0; i < zerosToAdd; i++) {
            result = string(abi.encodePacked(result, "0"));
        }
        
        // Add the fraction part
        result = string(abi.encodePacked(result, fractionStr));
        
        // Trim trailing zeros
        return _trimTrailingZeros(result);
    }
    
    // Helper function to convert uint to string
    function _uintToString(uint256 _value) internal pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        
        uint256 temp = _value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
            _value /= 10;
        }
        
        return string(buffer);
    }
    
    // Helper function to get string length
    function _strlen(string memory _str) internal pure returns (uint256) {
        return bytes(_str).length;
    }
    
    // Helper function to trim trailing zeros in a decimal string
    function _trimTrailingZeros(string memory _str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        uint256 length = strBytes.length;
        
        // Find position of last non-zero character
        uint256 lastNonZeroPos = length;
        for (uint256 i = length; i > 0; i--) {
            if (strBytes[i-1] != bytes1('0')) {
                lastNonZeroPos = i;
                break;
            }
        }
        
        // If last non-zero character is '.', include one '0' after it
        if (lastNonZeroPos > 0 && strBytes[lastNonZeroPos-1] == bytes1('.')) {
            lastNonZeroPos++;
        }
        
        // Create new string with trimmed zeros
        bytes memory result = new bytes(lastNonZeroPos);
        for (uint256 i = 0; i < lastNonZeroPos; i++) {
            result[i] = strBytes[i];
        }
        
        return string(result);
    }
}
