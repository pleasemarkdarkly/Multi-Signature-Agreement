// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

contract MultiSignature {
    string public author = "Law Office";

    uint public memberCount;
    mapping(address => uint) public members;
    mapping(address => bool) public isAdmin;

    constructor(){
        memberCount = 0;
    }    
}