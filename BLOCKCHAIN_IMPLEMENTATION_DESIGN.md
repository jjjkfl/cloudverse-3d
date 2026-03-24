# Blockchain Implementation Design for MCQ Pro
## Multi-Tenant SaaS Examination Platform

---

## Executive Summary

This document outlines the blockchain architecture for implementing decentralized certificate issuance, academic record verification, and credential management for the MCQ Pro platform.

---

## 1. Use Case Analysis

### Primary Blockchain Use Cases

| # | Use Case | Priority | Blockchain Benefit |
|---|----------|----------|-------------------|
| 1 | **Exam Certificate Issuance** | P0 | Tamper-proof, verifiable certificates |
| 2 | **Academic Record Storage** | P0 | Immutable grade history, cross-school verification |
| 3 | **Teacher Credential Verification** | P1 | Verify teacher qualifications, prevent fraud |
| 4 | **Question Bank NFTs** | P2 | Content creators own & monetize questions |
| 5 | **School Accreditation Badges** | P2 | Verifiable school certifications |
| 6 | **Student Digital Passport** | P1 | Portable academic credentials across institutions |

---

## 2. Recommended Blockchain Architecture

### Proposed Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Blockchain Network** | **Polygon (MATIC)** | Low gas fees, fast transactions, EVM compatible |
| **Smart Contract Language** | **Solidity** | Industry standard, mature tooling |
| **NFT Standard** | **ERC-721 + ERC-1155** | Certificates as NFTs, batch issuance |
| **Token Standard** | **ERC-20** | Reward tokens for educators/students |
| **Storage Layer** | **IPFS + Arweave** | Decentralized document storage |
| **Identity** | **Polygon ID / DID** | Self-sovereign identity for users |
| **Bridge** | **LayerZero / Wormhole** | Future cross-chain compatibility |

### Alternative: Consortium Blockchain (Private)

For Indian education sector compliance, consider:

| Technology | Use Case |
|-----------|----------|
| **Hyperledger Fabric** | Private consortium for school network |
| **Corda** | Financial/record transactions |
| **Quorum** | Enterprise-friendly Ethereum variant |

---

## 3. Smart Contract Architecture

```
MCQPro Contracts/
├── Core/
│   ├── MCQProCertificate.sol          # Main certificate NFT contract
│   ├── MCQProAcademicRecords.sol      # Academic record storage
│   ├── MCQProIdentityRegistry.sol     # DID registry for users
│   └── MCQProAccessControl.sol        # Role-based access (RBAC)
├── School/
│   ├── SchoolAccreditation.sol        # School verification NFTs
│   └── SchoolRegistry.sol             # Registered schools on-chain
├── Education/
│   ├── QuestionBankNFT.sol            # Question ownership NFTs
│   ├── TeacherCredential.sol          # Teacher certification
│   └── ExamResult.sol                 # Immutable exam results
└── Tokenomics/
    ├── MCQProToken.sol                # Reward token (ERC-20)
    └── StakingContract.sol            # Staking for educators
```

---

## 4. Data Structures & Schema

### Certificate NFT Metadata (ERC-721)

```json
{
  "name": "MCQ Pro Certificate - Class 10 Mathematics",
  "description": "Annual Examination Certificate 2025-26",
  "image": "ipfs://QmHash...",
  "external_url": "https://mcqpro.com/verify/{tokenId}",
  "attributes": [
    {
      "trait_type": "Certificate Type",
      "value": "Annual Examination"
    },
    {
      "trait_type": "Student Name",
      "value": "Rahul Sharma"
    },
    {
      "trait_type": "Roll Number",
      "value": "2024001"
    },
    {
      "trait_type": "School",
      "value": "JEMS MLPSD"
    },
    {
      "trait_type": "Class",
      "value": "10"
    },
    {
      "trait_type": "Section",
      "value": "A"
    },
    {
      "trait_type": "Academic Year",
      "value": "2025-26"
    },
    {
      "trait_type": "Subject",
      "value": "Mathematics"
    },
    {
      "trait_type": "Percentage",
      "value": "87.5"
    },
    {
      "trait_type": "Grade",
      "value": "A"
    },
    {
      "trait_type": "Rank",
      "value": "5"
    },
    {
      "trait_type": "Issue Date",
      "value": "2026-03-21"
    },
    {
      "trait_type": "Issuing Authority",
      "value": "Principal, JEMS MLPSD"
    },
    {
      "display_type": "date",
      "trait_type": "Valid From",
      "value": 1711000000
    },
    {
      "display_type": "number",
      "trait_type": "Certificate ID",
      "value": 12345
    },
    {
      "trait_type": "Blockchain",
      "value": "Polygon"
    },
    {
      "trait_type": "Verification Hash",
      "value": "0x8a2b3c..."
    }
  ],
  "blockchain_metadata": {
    "transaction_hash": "0x...",
    "contract_address": "0x...",
    "token_id": "12345",
    "network": "polygon-mainnet"
  }
}
```

### Academic Record Structure

```solidity
struct AcademicRecord {
    uint256 recordId;
    bytes32 studentDID;              // Decentralized ID
    bytes32 schoolDID;               // School's DID
    string subjectCode;              // e.g., "MATH101"
    uint8 classGrade;                // e.g., 10
    string section;                  // e.g., "A"
    uint256 examDate;                // Timestamp
    uint256 score;                   // Score obtained
    uint256 maxScore;                // Maximum possible score
    string grade;                    // e.g., "A", "B+"
    bytes32 ipfsHash;                // Reference to detailed result
    address issuer;                  // School's wallet address
    uint256 issuedAt;                // Timestamp
    bool isRevoked;                  // Certificate status
}
```

### School Accreditation NFT

```json
{
  "name": "JEMS MLPSD - Accredited School",
  "description": "Officially accredited school on MCQ Pro platform",
  "attributes": [
    {
      "trait_type": "School Name",
      "value": "JEMS MLPSD"
    },
    {
      "trait_type": "UDISE Code",
      "value": "12345678901"
    },
    {
      "trait_type": "Board",
      "value": "State Board"
    },
    {
      "trait_type": "Accreditation Level",
      "value": "A"
    },
    {
      "trait_type": "Valid Until",
      "value": "2027-03-31"
    },
    {
      "trait_type": "Total Students",
      "value": "1500"
    },
    {
      "trait_type": "School Type",
      "value": "Co-Educational"
    }
  ]
}
```

---

## 5. Smart Contract Interfaces

### Certificate Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MCQProCertificate is ERC721, AccessControl {

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _tokenIdCounter;

    struct CertificateData {
        uint256 certificateId;
        address studentWallet;
        address schoolWallet;
        string studentName;
        string schoolName;
        string subject;
        string classGrade;
        string section;
        uint256 score;
        string grade;
        uint256 issueDate;
        bytes32 ipfsHash;
        bool isValid;
    }

    mapping(uint256 => CertificateData) public certificates;
    mapping(bytes32 => uint256) public certificateByHash;
    mapping(address => uint256[]) public certificatesByStudent;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed school,
        bytes32 ipfsHash
    );

    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed school,
        string reason
    );

    constructor() ERC721("MCQ Pro Certificate", "MCQPC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @dev Issue a new certificate to a student
     * @param studentWallet Student's blockchain wallet address
     * @param studentName Name of the student
     * @param schoolName Name of the issuing school
     * @param ipfsHash IPFS hash of certificate metadata
     */
    function issueCertificate(
        address studentWallet,
        string memory studentName,
        string memory schoolName,
        string memory subject,
        string memory classGrade,
        string memory section,
        uint256 score,
        string memory grade,
        bytes32 ipfsHash
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        certificates[newTokenId] = CertificateData({
            certificateId: newTokenId,
            studentWallet: studentWallet,
            schoolWallet: msg.sender,
            studentName: studentName,
            schoolName: schoolName,
            subject: subject,
            classGrade: classGrade,
            section: section,
            score: score,
            grade: grade,
            issueDate: block.timestamp,
            ipfsHash: ipfsHash,
            isValid: true
        });

        certificateByHash[ipfsHash] = newTokenId;
        certificatesByStudent[studentWallet].push(newTokenId);

        _safeMint(studentWallet, newTokenId);

        emit CertificateIssued(newTokenId, studentWallet, msg.sender, ipfsHash);

        return newTokenId;
    }

    /**
     * @dev Verify a certificate by token ID
     */
    function verifyCertificate(uint256 tokenId) external view returns (
        bool isValid,
        CertificateData memory data
    ) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");

        CertificateData storage cert = certificates[tokenId];
        return (cert.isValid, cert);
    }

    /**
     * @dev Get all certificates for a student
     */
    function getStudentCertificates(address student) external view returns (
        uint256[] memory tokenIds
    ) {
        return certificatesByStudent[student];
    }

    /**
     * @dev Revoke a certificate (only by issuing school)
     */
    function revokeCertificate(uint256 tokenId, string memory reason)
        external
        onlyRole(ISSUER_ROLE)
    {
        require(certificates[tokenId].schoolWallet == msg.sender, "Not authorized");
        certificates[tokenId].isValid = false;
        emit CertificateRevoked(tokenId, msg.sender, reason);
    }

    /**
     * @dev Add authorized school issuers
     */
    function addSchoolIssuer(address schoolWallet) external onlyRole(ADMIN_ROLE) {
        _grantRole(ISSUER_ROLE, schoolWallet);
    }
}
```

### Academic Records Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MCQProAcademicRecords {

    struct AcademicRecord {
        uint256 recordId;
        bytes32 studentDID;
        bytes32 schoolDID;
        string subjectCode;
        uint8 classGrade;
        string section;
        uint256 examDate;
        uint256 score;
        uint256 maxScore;
        string grade;
        bytes32 ipfsHash;
        address issuer;
        uint256 issuedAt;
        bool isRevoked;
    }

    mapping(uint256 => AcademicRecord) public records;
    mapping(bytes32 => uint256[]) public recordsByStudentDID;
    mapping(bytes32 => uint256[]) public recordsBySchoolDID;

    uint256 private recordCounter;

    // Authorized issuers (schools)
    mapping(address => bool) public authorizedIssuers;
    mapping(address => bytes32) public issuerToDID;

    event RecordAdded(
        uint256 indexed recordId,
        bytes32 indexed studentDID,
        bytes32 indexed schoolDID,
        string subject,
        uint256 score
    );

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        authorizedIssuers[msg.sender] = true;
    }

    function addAcademicRecord(
        bytes32 studentDID,
        bytes32 schoolDID,
        string memory subjectCode,
        uint8 classGrade,
        string memory section,
        uint256 examDate,
        uint256 score,
        uint256 maxScore,
        string memory grade,
        bytes32 ipfsHash
    ) external onlyAuthorized returns (uint256) {
        recordCounter++;
        uint256 recordId = recordCounter;

        records[recordId] = AcademicRecord({
            recordId: recordId,
            studentDID: studentDID,
            schoolDID: schoolDID,
            subjectCode: subjectCode,
            classGrade: classGrade,
            section: section,
            examDate: examDate,
            score: score,
            maxScore: maxScore,
            grade: grade,
            ipfsHash: ipfsHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            isRevoked: false
        });

        recordsByStudentDID[studentDID].push(recordId);
        recordsBySchoolDID[schoolDID].push(recordId);

        emit RecordAdded(recordId, studentDID, schoolDID, subjectCode, score);

        return recordId;
    }

    function getStudentRecords(bytes32 studentDID) external view returns (
        AcademicRecord[] memory
    ) {
        uint256[] memory recordIds = recordsByStudentDID[studentDID];
        AcademicRecord[] memory studentRecords = new AcademicRecord[](recordIds.length);

        for (uint256 i = 0; i < recordIds.length; i++) {
            studentRecords[i] = records[recordIds[i]];
        }

        return studentRecords;
    }

    function verifyRecord(uint256 recordId) external view returns (
        bool isValid,
        AcademicRecord memory record
    ) {
        AcademicRecord storage r = records[recordId];
        return (!r.isRevoked && r.recordId != 0, r);
    }
}
```

---

## 6. Database Schema Updates

### New Tables for Blockchain Integration

```sql
-- Blockchain wallet addresses for users
CREATE TABLE blockchain_wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    wallet_type ENUM('METAMASK', 'PHANTOM', 'TRUST', 'COINBASE') DEFAULT 'METAMASK',
    is_verified BOOLEAN DEFAULT FALSE,
    signature VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Certificate registry (off-chain index)
CREATE TABLE blockchain_certificates (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    exam_id VARCHAR(36),
    token_id BIGINT NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    network VARCHAR(20) DEFAULT 'polygon-mainnet',
    ipfs_hash VARCHAR(255),
    metadata_uri TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    INDEX idx_user_certificates (user_id),
    INDEX idx_token_id (token_id, contract_address)
);

-- Academic records on-chain
CREATE TABLE blockchain_academic_records (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36),
    record_id_onchain BIGINT NOT NULL,
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    ipfs_hash VARCHAR(255),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    INDEX idx_user_records (user_id)
);

-- School blockchain credentials
CREATE TABLE school_blockchain_credentials (
    id VARCHAR(36) PRIMARY KEY,
    school_id VARCHAR(36) NOT NULL UNIQUE,
    wallet_address VARCHAR(42) NOT NULL,
    private_key_encrypted TEXT, -- Encrypted private key
    did_identifier VARCHAR(255),
    is_authorized_issuer BOOLEAN DEFAULT FALSE,
    accreditation_token_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Question Bank NFTs
CREATE TABLE question_nfts (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    creator_user_id VARCHAR(36) NOT NULL,
    token_id BIGINT NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    royalty_percentage INT DEFAULT 5,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (creator_user_id) REFERENCES users(id)
);

-- Blockchain transactions log
CREATE TABLE blockchain_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_type ENUM('CERTIFICATE_ISSUE', 'CERTIFICATE_REVOKE', 'RECORD_ADD', 'NFT_MINT', 'TOKEN_TRANSFER'),
    user_id VARCHAR(36),
    school_id VARCHAR(36),
    transaction_hash VARCHAR(66) NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    amount DECIMAL(20,8),
    gas_used BIGINT,
    gas_price BIGINT,
    status ENUM('PENDING', 'CONFIRMED', 'FAILED') DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id),
    INDEX idx_tx_hash (transaction_hash),
    INDEX idx_status (status)
);
```

---

## 7. API Endpoints

### Blockchain Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/blockchain/wallet/connect` | Connect wallet to user account |
| POST | `/api/blockchain/wallet/verify` | Verify wallet signature |
| GET | `/api/blockchain/wallet/:userId` | Get user's wallet address |
| POST | `/api/blockchain/certificate/issue` | Issue certificate on blockchain |
| GET | `/api/blockchain/certificate/:tokenId` | Get certificate details |
| POST | `/api/blockchain/certificate/:tokenId/revoke` | Revoke a certificate |
| GET | `/api/blockchain/certificates/user/:userId` | Get user's all certificates |
| POST | `/api/blockchain/record/add` | Add academic record on-chain |
| GET | `/api/blockchain/record/:recordId/verify` | Verify academic record |
| GET | `/api/blockchain/records/user/:userId` | Get user's academic records |
| POST | `/api/blockchain/school/register` | Register school on blockchain |
| GET | `/api/blockchain/school/accreditation` | Get school accreditation status |

---

## 8. Frontend Components

```
frontend/src/
├── components/
│   ├── blockchain/
│   │   ├── WalletConnect.tsx         # Web3 wallet connection
│   │   ├── CertificateViewer.tsx     # View certificate NFT
│   │   ├── CertificateMinter.tsx     # Mint certificate UI
│   │   ├── VerificationBadge.tsx     # Verification status badge
│   │   └── NFTGallery.tsx            # Student's certificate gallery
│   └── ...
├── pages/
│   ├── student/
│   │   ├── MyCertificates.tsx        # Student's certificate wallet
│   │   └── AcademicPassport.tsx      # Academic record passport
│   ├── school/
│   │   ├── BlockchainSettings.tsx    # School blockchain config
│   │   └── CertificateIssue.tsx      # Bulk certificate issuance
│   └── verification/
│       └── VerifyCertificate.tsx     # Public certificate verification
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Polygon testnet deployment
- [ ] Deploy smart contracts to testnet
- [ ] Create wallet connection flow
- [ ] Implement basic certificate issuance

### Phase 2: Integration (Weeks 5-8)
- [ ] Integrate with existing exam system
- [ ] Auto-mint certificates on exam completion
- [ ] IPFS document storage integration
- [ ] Certificate verification page

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Academic records storage
- [ ] Teacher credentials NFTs
- [ ] School accreditation badges
- [ ] Student digital passport

### Phase 4: Tokenomics (Weeks 13-16)
- [ ] MCQPro token deployment
- [ ] Reward system for educators
- [ ] Staking mechanisms
- [ ] Marketplace for questions

### Phase 5: Production (Weeks 17-20)
- [ ] Security audits
- [ ] Mainnet deployment
- [ ] Load testing
- [ ] Documentation and training

---

## 10. Cost Estimates

### Development Costs (INR)

| Item | Cost (INR) | Notes |
|------|-----------|-------|
| Smart Contract Development | ₹5,00,000 | 4 contracts + testing |
| Frontend Integration | ₹3,00,000 | Wallet, NFT viewer |
| Backend API Development | ₹2,50,000 | Blockchain APIs |
| Security Audit | ₹3,00,000 | CertiK / QuillAudits |
| IPFS/Storage Setup | ₹50,000 | Pinata / NFT.Storage |
| **Total Development** | **₹14,00,000** | |
| Maintenance/Year | ₹3,00,000 | Updates + support |

### Transaction Costs (Per Transaction - Polygon)

| Operation | Gas Cost (MATIC) | INR (approx) |
|-----------|------------------|--------------|
| Certificate Issue | ~0.01 MATIC | ₹0.08 |
| Certificate Transfer | ~0.005 MATIC | ₹0.04 |
| Record Add | ~0.015 MATIC | ₹0.12 |
| NFT Mint | ~0.02 MATIC | ₹0.16 |

### Monthly Infrastructure Costs

| Service | Cost (INR/month) |
|---------|------------------|
| IPFS (Pinata) | ₹2,000 |
| RPC Nodes (Alchemy/QuickNode) | ₹5,000 |
| TheGraph (Indexing) | ₹3,000 |
| **Total** | **₹10,000** |

---

## 11. Security Considerations

### Smart Contract Security
1. **OpenZeppelin** contracts for base functionality
2. **Access Control** - Role-based permissions
3. **Pausable** contracts for emergency stops
4. **ReentrancyGuard** on state-changing functions
5. **Timelock** for admin operations

### Backend Security
1. Encrypted private key storage (AES-256)
2. Hardware Security Module (HSM) for school keys
3. Rate limiting on blockchain operations
4. Transaction nonce management

### Frontend Security
1. Web3.js / Ethers.js integration
2. Signature verification for wallet ownership
3. Prevent front-running on transactions

---

## 12: Compliance & Legal

### Indian Education Sector Compliance

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **DPDP Act 2023** | Student data protection | Encrypted DIDs, minimal on-chain data |
| **UGC/AICTE** | Certificate authenticity | Blockchain-verified certificates |
| **CBSE/State Boards** | Grade verification | Immutable academic records |
| **GDPR** | Data portability | Student controls their data |

---

## 13. Tech Stack Summary

```yaml
Blockchain:
  Network: Polygon (MATIC)
  Smart Contracts: Solidity ^0.8.20
  Development Framework: Hardhat / Foundry

Frontend:
  Web3 Library: ethers.js / viem
  Wallet Connect: RainbowKit / ConnectKit
  IPFS: ipfs-http-client

Backend:
  Web3 Provider: ethers.js (Node.js)
  Queue: Bull Queue for transaction processing
  Cache: Redis for pending transactions

Storage:
  IPFS: Pinata / NFT.Storage
  Arweave: Permanent certificate storage

Infrastructure:
  RPC: Alchemy / QuickNode
  Indexing: The Graph Protocol
  Monitoring: Tenderly
```

---

## 14. Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Certificates Issued | 10,000+ | 6 months |
| Schools Onboarded | 50+ | 6 months |
| Verification API Calls | 100K+ | 12 months |
| Gas Costs Saved | 90%+ | vs Ethereum mainnet |
| Certificate Verification Time | <2 seconds | Public verification page |

---

## 15. Next Steps for Blockchain Team

### Immediate Actions
1. Review and approve architecture
2. Set up Polygon Mumbai testnet environment
3. Create technical specification for each smart contract
4. Design IPFS document structure
5. Plan security audit timeline

### Deliverables
1. Smart Contract Suite (4-5 contracts)
2. Backend Blockchain Service Layer
3. Frontend Wallet Integration
4. Admin Panel for Certificate Management
5. Public Verification Portal
6. API Documentation

---

*Document prepared for MCQ Pro Blockchain Implementation*
*Date: March 21, 2026*
