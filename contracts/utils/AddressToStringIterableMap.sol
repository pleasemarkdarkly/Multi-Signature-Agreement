// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

contract AddressToStringIterableMap {
    struct Entry {
        uint index;
        string value;
    }
    mapping(address => Entry) internal map;
    address[] internal keyList;

    event Debug(address, string, uint, uint);

    function add(address _key, string memory _value) public {
        Entry storage entry = map[_key];
        entry.value = _value;
        if (entry.index > 0){
            return;
        } else {
            keyList.push(_key);
            uint keyListIndex = keyList.length - 1;
            entry.index = keyListIndex + 1;
        }
        emit Debug(_key, _value, entry.index, keyList.length);
    }

    function size() public view returns(uint){
        return uint(keyList.length);
    }

    function contains(address _key) public view returns(bool) {
        return map[_key].index > 0;
    }
    
    function getByKey(address _key) public returns(string memory) {
        emit Debug(_key, map[_key].value, map[_key].index, keyList.length);
        return map[_key].value;
    }

    function getByIndex(uint _index) public returns(string memory){
        require(_index >= 0 && _index < keyList.length, "Index entry out of bounds");        
        emit Debug(keyList[_index], map[keyList[_index]].value, _index, keyList.length);
        return map[keyList[_index]].value;
    }

    function getKeys() public view returns(address[] memory) {
        return keyList;
    }

    function remove(address _key) public {
        Entry storage entry = map[_key];
        require(entry.index <= keyList.length, "Invalid index");
        uint keyListIndex = entry.index - 1;    
        uint keyListLastIndex = keyList.length - 1; 
        map[keyList[keyListLastIndex]].index = keyListIndex + 1;
        keyList[keyListIndex] = keyList[keyListLastIndex];
        keyList.pop();
        delete map[_key];
    }
}

// "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "pears"
// "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "cabbages"
// "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", "potatoes"
// "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", "telephones"
// "0x17F6AD8Ef982297579C203069C1DbfFE4348c372", "cheeseburgers"
// "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "fries"
