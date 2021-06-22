// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract MultiSignatureAgreementV2 {    

    event Deposit(address indexed sender, uint amount, uint balance);    
    event SubmitTransaction(address indexed owner, uint indexed txIndex, address indexed to, uint value, bytes data);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeTransaction(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    string public constant attorney = "reed@yurchaklaw.com"; 
    string public constant author = "mark.phillips@gmail.com";

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;
    
    struct Transaction{
        address to;
        uint value;
        bytes data;
        bool executed;        
        uint numConfirmations;
    }

    // tx index => owner => confirmed
    mapping(uint => mapping(address => bool)) public isConfirmed;
    Transaction[] transactions;

    fallback() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    receive() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
    
    function initialize(address[] memory _owners, uint _numConfirmationsRequired) public {
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length, "INVALID NUMBER OF CONFIRMATIONS");
        for (uint i = 0; i < _owners.length; i++){
            address owner = _owners[i];
            require(owner != address(0), "INVALID OWNER ADDRESS");            
            require(!isOwner[owner], "OWNER IS NOT UNIQUE");
            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    } 

    modifier onlyOwner() {
        require(isOwner[msg.sender], "REQUIRES OWNER ACCESS");
        _;
    }

    modifier txExists(uint index){
        require(index < transactions.length, "TRANSACTION DOES NOT EXIST");
        _;
    }

    modifier notExecuted(uint index){
        require(!transactions[index].executed, "TRANSACTION ALREADY EXECUTED");
        _;
    }

    modifier notConfirmed(uint index){
        require(!isConfirmed[index][msg.sender], "TRANSACTION ALREADY CONFIRMED");
        _;
    }

    function deposit() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(address to, uint value, bytes memory data) public onlyOwner { 
        uint txIndex = transactions.length;            
        transactions.push(Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            numConfirmations: 0            
        }));
        emit SubmitTransaction(msg.sender, txIndex, to, value, data);
    }

    function confirmTransaction(uint index) public onlyOwner txExists(index) notExecuted(index) notConfirmed(index){ 
        Transaction storage transaction = transactions[index];
        isConfirmed[index][msg.sender] = true; 
        transaction.numConfirmations += 1;
        emit ConfirmTransaction(msg.sender, index);
    }

    function executeTransaction(uint index) public onlyOwner txExists(index) notExecuted(index){ 
        Transaction storage transaction = transactions[index];
        require(transaction.numConfirmations >= numConfirmationsRequired, "CONFIRMATIONS REQUIRED");
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "TRANSACTION FAILED TO EXECUTE");
        emit ExecuteTransaction(msg.sender, index);
    }

    function revokeConfirmation(uint index) public onlyOwner txExists(index) notExecuted(index){ 
        Transaction storage transaction = transactions[index];
        require(isConfirmed[index][msg.sender], "TRANSACTION HAS NOT BEEN CONFIRMED");        
        transaction.numConfirmations -= 1;
        isConfirmed[index][msg.sender] = false;        
        emit RevokeTransaction(msg.sender, index);
    }

    function getOwners() public view returns(address[] memory){
        return owners;
    }

    function getTransactionCount() public view returns(uint){
        return transactions.length;
    }

    function getTransaction(uint index) public view onlyOwner txExists(index) returns(address, uint, bytes memory, bool, uint){        
        Transaction storage transaction = transactions[index];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}

contract RandomContract {        
    uint public internal_value;
    event Print(uint, string);
    function initialize() public {
        internal_value = 1;
    }

    function addition(uint256 value) public returns(uint256){
        internal_value += value;
        emit Print(internal_value, "addition was finally called");
        return (internal_value);
    }

    function clearValue() public {
        internal_value = 0;
    }

    function generateExternalCallData() public pure returns(bytes memory){
        return abi.encodeWithSignature("addition(uint256)", 123456789);
    }
}