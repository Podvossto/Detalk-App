// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract TokenContract {
    string public name = "Chat Token";
    string public symbol = "CHAT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    address public owner;

    // Only this address (the ChatContract) may mint through requestTokens(address,uint256)
    address public minter;
    
    mapping(address => uint256) private balances;
    
    mapping(address => mapping(address => uint256)) private allowed;
    
    uint256 public requestCooldown = 24 hours;
    
    mapping(address => uint256) private lastRequestTime;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event TokensRequested(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MinterUpdated(address indexed previousMinter, address indexed newMinter);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setMinter(address newMinter) public onlyOwner {
        emit MinterUpdated(minter, newMinter);
        minter = newMinter;
    }
    
    // Get the token balance for account
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
    
    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_value <= balances[msg.sender], "Insufficient balance");
        
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    // Send _value amount of tokens from address _from to address _to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_value <= balances[_from], "Insufficient balance");
        require(_value <= allowed[_from][msg.sender], "Insufficient allowance");
        
        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    // Allow _spender to withdraw from your account, multiple times, up to the _value amount
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    // Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }
    
    // Mint new tokens
    function mint(address _to, uint256 _amount) public onlyOwner returns (bool) {
        require(_to != address(0), "Cannot mint to zero address");
        
        totalSupply += _amount;
        balances[_to] += _amount;
        
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
        return true;
    }
    
    // Request tokens from the faucet (limited by cooldown)
    function requestTokens() public returns (bool) {
        require(
            lastRequestTime[msg.sender] == 0 || block.timestamp >= lastRequestTime[msg.sender] + requestCooldown,
            "Cooldown period not over yet"
        );
        
        uint256 amount = 10 * 10**18;
        lastRequestTime[msg.sender] = block.timestamp;
        
        totalSupply += amount;
        balances[msg.sender] += amount;
        
        emit TokensRequested(msg.sender, amount);
        emit Transfer(address(0), msg.sender, amount);
        return true;
    }
    
    // Mint to a specific address on behalf of the ChatContract (sign-up bonus)
    function requestTokens(address _recipient, uint256 _amount) public onlyMinter returns (bool) {
        require(_recipient != address(0), "Cannot mint to zero address");

        totalSupply += _amount;
        balances[_recipient] += _amount;
        
        emit TokensRequested(_recipient, _amount);
        emit Transfer(address(0), _recipient, _amount);
        return true;
    }
    
    // Get cooldown time remaining for an address
    function getCooldownRemaining() public view returns (uint256) {
        if (lastRequestTime[msg.sender] == 0) {
            return 0;
        }
        
        uint256 timeSinceLastRequest = block.timestamp - lastRequestTime[msg.sender];
        
        if (timeSinceLastRequest >= requestCooldown) {
            return 0;
        }
        
        return requestCooldown - timeSinceLastRequest;
    }
}
