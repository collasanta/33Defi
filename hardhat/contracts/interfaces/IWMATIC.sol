// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

interface IWMATIC {
     function deposit() external payable;
     function withdraw(uint) external;
     function approve(address, uint) external returns (bool);
     function allowance(address, address) external;
     function balanceOf(address) external view returns (uint256);
}