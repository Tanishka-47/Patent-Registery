// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Blockchain-based Patent Registry (Research Demo)
/// @notice Illustrative contract for secure patent registration and transfer

contract PatentRegistry {
    address public admin;

    enum TransferStatus { None, Pending, Approved, Rejected, Completed }

    struct Patent {
        string title;
        string inventor;
        string metadataHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }

    struct TransferRequest {
        uint256 patentId;
        address from;
        address to;
        TransferStatus status;
        uint256 timestamp;
    }

    // patentId => current transfer request
    mapping(uint256 => TransferRequest) public transferRequests;

    mapping(uint256 => Patent) public patents;
    uint256 public patentCount;

    event PatentRegistered(uint256 indexed patentId, address indexed owner);
    event TransferRequested(uint256 indexed patentId, address indexed from, address indexed to, uint256 timestamp);
    event TransferApproved(uint256 indexed patentId, address indexed from, address indexed to, uint256 timestamp);
    event TransferRejected(uint256 indexed patentId, address indexed from, address indexed to, uint256 timestamp);
    event OwnershipTransferred(uint256 indexed patentId, address indexed from, address indexed to, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }
    address public admin;

    struct Patent {
        string title;
        string inventor;
        string metadataHash; // IPFS or encrypted hash of patent document
        address owner;
        uint256 timestamp;
        bool exists;
    }

    // Patent ID => Patent
    mapping(uint256 => Patent) public patents;
    // Patent ID => transfer approvals
    mapping(uint256 => mapping(address => bool)) public transferApprovals;

    uint256 public patentCount;

    // Events for audit trail
    event PatentRegistered(uint256 indexed patentId, address indexed owner);
    event OwnershipTransferred(uint256 indexed patentId, address indexed from, address indexed to);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyOwner(uint256 patentId) {
        require(patents[patentId].owner == msg.sender, "Not patent owner");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Register a new patent
    function registerPatent(string memory _title, string memory _inventor, string memory _metadataHash) public {
        patentCount++;
        patents[patentCount] = Patent({
            title: _title,
            inventor: _inventor,
            metadataHash: _metadataHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        emit PatentRegistered(patentCount, msg.sender);
    }

    // Request transfer (owner initiates)
    function requestTransfer(uint256 patentId, address to) public {
        require(patents[patentId].exists, "Patent does not exist");
        require(msg.sender == patents[patentId].owner, "Only owner can request transfer");
        require(to != address(0), "Invalid recipient");
        require(transferRequests[patentId].status != TransferStatus.Pending, "Transfer already pending");
        transferRequests[patentId] = TransferRequest({
            patentId: patentId,
            from: msg.sender,
            to: to,
            status: TransferStatus.Pending,
            timestamp: block.timestamp
        });
        emit TransferRequested(patentId, msg.sender, to, block.timestamp);
    }

    // Recipient approves transfer
    function approveTransfer(uint256 patentId) public {
        TransferRequest storage req = transferRequests[patentId];
        require(req.status == TransferStatus.Pending, "No pending transfer");
        require(msg.sender == req.to, "Only recipient can approve");
        req.status = TransferStatus.Approved;
        emit TransferApproved(patentId, req.from, msg.sender, block.timestamp);

        // Complete the transfer immediately
        address prevOwner = patents[patentId].owner;
        patents[patentId].owner = req.to;
        req.status = TransferStatus.Completed;
        emit OwnershipTransferred(patentId, prevOwner, req.to, block.timestamp);
    }

    // Recipient rejects transfer
    function rejectTransfer(uint256 patentId) public {
        TransferRequest storage req = transferRequests[patentId];
        require(req.status == TransferStatus.Pending, "No pending transfer");
        require(msg.sender == req.to, "Only recipient can reject");
        req.status = TransferStatus.Rejected;
        emit TransferRejected(patentId, req.from, msg.sender, block.timestamp);
    }

    // View transfer request for a patent
    function getTransferRequest(uint256 patentId) public view returns (
        uint256, address, address, TransferStatus, uint256
    ) {
        TransferRequest memory req = transferRequests[patentId];
        return (req.patentId, req.from, req.to, req.status, req.timestamp);
    }

    /// @notice Get patent details (metadataHash can be used to retrieve off-chain encrypted document)
    function getPatent(uint256 patentId) public view returns (
        string memory title,
        string memory inventor,
        string memory metadataHash,
        address owner,
        uint256 timestamp
    ) {
        require(patents[patentId].exists, "Patent does not exist");
        Patent memory p = patents[patentId];
        return (p.title, p.inventor, p.metadataHash, p.owner, p.timestamp);
    }
}
