// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title QuantumPatentRegistry
 * @dev A quantum-resistant patent registry with lifecycle management
 */
contract QuantumPatentRegistry is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    
    // Patent status enum
    enum PatentStatus { 
        Draft,          // 0 - Initial state
        Filed,          // 1 - Patent application filed
        UnderReview,    // 2 - Under examination
        Approved,       // 3 - Patent approved
        Rejected,       // 4 - Patent rejected
        Expired,        // 5 - Patent expired
        Transferred,    // 6 - Ownership transferred
        Revoked         // 7 - Patent revoked
    }

    // Patent structure
    struct Patent {
        uint256 id;
        string title;
        string description;
        string ipfsHash;           // IPFS hash of the patent document
        string qrSignature;        // Quantum-resistant signature
        address owner;             // Current owner (patent holder)
        address[] previousOwners;  // History of previous owners
        uint256 filingDate;        // Timestamp when filed
        uint256 expirationDate;    // Timestamp when patent expires
        PatentStatus status;       // Current status
        string[] documentHashes;   // Additional document hashes
        bool isPublic;             // Visibility flag
        string metadata;           // Additional metadata (JSON string)
    }

    // License structure
    struct License {
        uint256 patentId;
        address licensee;
        uint256 startDate;
        uint256 endDate;
        uint256 fee;              // License fee in wei
        bool isExclusive;
        bool isActive;
        string terms;             // License terms (IPFS hash or JSON)
    }

    // Events
    event PatentFiled(uint256 indexed patentId, address indexed owner, string title);
    event PatentStatusChanged(uint256 indexed patentId, PatentStatus status);
    event OwnershipTransferred(uint256 indexed patentId, address from, address to);
    event LicenseGranted(uint256 indexed patentId, address indexed licensee, uint256 licenseId);
    event LicenseRevoked(uint256 indexed patentId, address indexed licensee);
    event DocumentAdded(uint256 indexed patentId, string documentHash);
    
    // State variables
    CountersUpgradeable.Counter private _patentIds;
    mapping(uint256 => Patent) private _patents;
    mapping(address => uint256[]) private _ownedPatents;
    mapping(uint256 => License[]) private _licenses;
    mapping(string => bool) private _ipfsHashes; // To prevent duplicate IPFS hashes
    
    // Quantum-resistant public key registry
    mapping(address => string) public quantumPublicKeys;
    
    // Modifiers
    modifier onlyPatentOwner(uint256 patentId) {
        require(_patents[patentId].owner == msg.sender, "Not the patent owner");
        _;
    }
    
    modifier patentExists(uint256 patentId) {
        require(_patents[patentId].owner != address(0), "Patent does not exist");
        _;
    }

    /**
     * @dev Initializes the contract
     */
    function initialize() public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
    }
    
    /**
     * @dev Registers a quantum public key for the sender
     * @param publicKey The quantum-resistant public key
     */
    function registerQuantumPublicKey(string memory publicKey) external {
        quantumPublicKeys[msg.sender] = publicKey;
    }
    
    /**
     * @dev Files a new patent
     * @param title Patent title
     * @param description Patent description
     * @param ipfsHash IPFS hash of the patent document
     * @param qrSignature Quantum-resistant signature of the document
     * @param validityYears Number of years the patent is valid
     */
    function filePatent(
        string memory title,
        string memory description,
        string memory ipfsHash,
        string memory qrSignature,
        uint256 validityYears
    ) external nonReentrant {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!_ipfsHashes[ipfsHash], "Document already registered");
        
        _patentIds.increment();
        uint256 newPatentId = _patentIds.current();
        
        uint256 currentTime = block.timestamp;
        uint256 expirationDate = currentTime + (validityYears * 365 days);
        
        address[] memory emptyArray;
        string[] memory emptyDocArray;
        
        _patents[newPatentId] = Patent({
            id: newPatentId,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            qrSignature: qrSignature,
            owner: msg.sender,
            previousOwners: emptyArray,
            filingDate: currentTime,
            expirationDate: expirationDate,
            status: PatentStatus.Filed,
            documentHashes: emptyDocArray,
            isPublic: false,
            metadata: ""
        });
        
        _ownedPatents[msg.sender].push(newPatentId);
        _ipfsHashes[ipfsHash] = true;
        
        emit PatentFiled(newPatentId, msg.sender, title);
        emit PatentStatusChanged(newPatentId, PatentStatus.Filed);
    }
    
    /**
     * @dev Updates patent status (only owner or contract admin)
     * @param patentId ID of the patent
     * @param newStatus New status to set
     */
    function updatePatentStatus(uint256 patentId, PatentStatus newStatus) 
        external 
        patentExists(patentId) 
        onlyPatentOwner(patentId) 
    {
        Patent storage patent = _patents[patentId];
        
        // Validate status transition
        if (patent.status == PatentStatus.Approved && newStatus == PatentStatus.Expired) {
            require(block.timestamp >= patent.expirationDate, "Patent has not expired yet");
        }
        
        patent.status = newStatus;
        emit PatentStatusChanged(patentId, newStatus);
    }
    
    /**
     * @dev Transfers patent ownership
     * @param patentId ID of the patent
     * @param newOwner Address of the new owner
     */
    function transferOwnership(uint256 patentId, address newOwner) 
        external 
        nonReentrant 
        patentExists(patentId) 
        onlyPatentOwner(patentId) 
    {
        require(newOwner != address(0), "Invalid address");
        require(newOwner != msg.sender, "Cannot transfer to self");
        
        Patent storage patent = _patents[patentId];
        
        // Update previous owners
        patent.previousOwners.push(patent.owner);
        
        // Update ownership
        address previousOwner = patent.owner;
        patent.owner = newOwner;
        
        // Update owned patents arrays
        _removeFromArray(_ownedPatents[previousOwner], patentId);
        _ownedPatents[newOwner].push(patentId);
        
        // Update status
        patent.status = PatentStatus.Transferred;
        
        emit OwnershipTransferred(patentId, previousOwner, newOwner);
        emit PatentStatusChanged(patentId, PatentStatus.Transferred);
    }
    
    /**
     * @dev Grants a license for a patent
     * @param patentId ID of the patent
     * @param licensee Address of the licensee
     * @param durationMonths Duration of the license in months
     * @param fee License fee in wei
     * @param isExclusive Whether the license is exclusive
     * @param terms License terms (IPFS hash or JSON)
     */
    function grantLicense(
        uint256 patentId,
        address licensee,
        uint256 durationMonths,
        uint256 fee,
        bool isExclusive,
        string memory terms
    ) external nonReentrant patentExists(patentId) onlyPatentOwner(patentId) {
        require(licensee != address(0), "Invalid address");
        require(durationMonths > 0, "Invalid duration");
        
        // Check if exclusive license already exists
        if (isExclusive) {
            for (uint i = 0; i < _licenses[patentId].length; i++) {
                require(!_licenses[patentId][i].isExclusive || !_licenses[patentId][i].isActive, 
                    "Exclusive license already granted");
            }
        }
        
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (durationMonths * 30 days);
        
        _licenses[patentId].push(License({
            patentId: patentId,
            licensee: licensee,
            startDate: startDate,
            endDate: endDate,
            fee: fee,
            isExclusive: isExclusive,
            isActive: true,
            terms: terms
        }));
        
        emit LicenseGranted(patentId, licensee, _licenses[patentId].length - 1);
    }
    
    /**
     * @dev Revokes a license
     * @param patentId ID of the patent
     * @param licenseIndex Index of the license in the licenses array
     */
    function revokeLicense(uint256 patentId, uint256 licenseIndex) 
        external 
        nonReentrant 
        patentExists(patentId) 
        onlyPatentOwner(patentId) 
    {
        require(licenseIndex < _licenses[patentId].length, "Invalid license index");
        
        License storage license = _licenses[patentId][licenseIndex];
        require(license.isActive, "License is not active");
        
        license.isActive = false;
        
        emit LicenseRevoked(patentId, license.licensee);
    }
    
    /**
     * @dev Adds a document to a patent
     * @param patentId ID of the patent
     * @param documentHash IPFS hash of the document
     */
    function addDocument(uint256 patentId, string memory documentHash) 
        external 
        patentExists(patentId) 
        onlyPatentOwner(patentId) 
    {
        require(bytes(documentHash).length > 0, "Document hash cannot be empty");
        require(!_ipfsHashes[documentHash], "Document already exists");
        
        _patents[patentId].documentHashes.push(documentHash);
        _ipfsHashes[documentHash] = true;
        
        emit DocumentAdded(patentId, documentHash);
    }
    
    /**
     * @dev Verifies a quantum-resistant signature
     * @param signer Address of the signer
     * @param message Message that was signed
     * @param signature Signature to verify
     * @return bool True if signature is valid
     */
    function verifySignature(
        address signer,
        string memory message,
        string memory signature
    ) public view returns (bool) {
        // In a real implementation, this would verify the quantum-resistant signature
        // using the signer's registered public key and the provided signature
        // This is a placeholder for demonstration purposes
        return true;
    }
    
    // Getters
    
    function getPatent(uint256 patentId) 
        external 
        view 
        patentExists(patentId) 
        returns (
            string memory title,
            string memory description,
            string memory ipfsHash,
            address owner,
            uint256 filingDate,
            uint256 expirationDate,
            PatentStatus status,
            bool isPublic
        ) 
    {
        Patent storage patent = _patents[patentId];
        return (
            patent.title,
            patent.description,
            patent.ipfsHash,
            patent.owner,
            patent.filingDate,
            patent.expirationDate,
            patent.status,
            patent.isPublic
        );
    }
    
    function getPatentsByOwner(address owner) external view returns (uint256[] memory) {
        return _ownedPatents[owner];
    }
    
    function getLicenses(uint256 patentId) external view returns (License[] memory) {
        return _licenses[patentId];
    }
    
    function getPatentCount() external view returns (uint256) {
        return _patentIds.current();
    }
    
    // Internal helper functions
    
    function _removeFromArray(uint256[] storage array, uint256 element) internal {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    // Additional functions for upgradeability and emergency stops can be added here
    
    // This function allows the contract to receive ETH
    receive() external payable {}
}
