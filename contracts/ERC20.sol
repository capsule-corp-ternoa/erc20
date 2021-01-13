// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TernoaToken is ERC20 {
    constructor(address vault) public ERC20("CapsuleCoin", "CACO") {
        // We create 2.5B coins but the token has 18 decimals.
        _mint(vault, 2500000000 * (10 ^ 18));
    }
}
