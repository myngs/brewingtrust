## 🛠️ Blockchain Setup for Professor Demo (MANDATORY)

### 1. **Start Ganache (Local Blockchain)**

```
npx ganache --chain.chainId 1337 --accounts 10 --host 127.0.0.1 --port 7545 --deterministic
```

**Copy the PRIVATE_KEY of ACCOUNT #3** (3rd account - has funds by default)

### 2. **Deploy Contract**

```
cd blockchain
npm i
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

Copy the contract address output.

### 3. **Server .env** (Account #3)

```
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x[Ganache Account #3 Private Key]
CONTRACT_ADDRESS=[Your Deployed Contract Address]
```

### 4. **Test Blockchain** (Terminal shows TX)

```
npm start  # Server
```

**Clock-in shows:**

```
🔗 BLOCKCHAIN TX START:
✅ BLOCKCHAIN TX SUCCESS: 0x...
⛽ Gas used: 12345
📦 Block: 456
```

### 5. **Verify** (Ganache UI)

- **Transactions tab** → See gas usage + TX hashes
- **Contracts tab** → Call `getAttendanceRecord` with employee wallet

### 6. **Demo Flow**

```
1. Employee clocks in → Terminal TX + gas
2. Admin /api/attendance/all → blockchainTxHash
3. /api/attendance/verify/20241201 → ✅ Blockchain verified
```

### 🔍 **Test Commands**

```
# Login (get JWT)
curl -X POST http://localhost:5000/api/auth/login -d '{"email":"employee@test.com","password":"123"}'

# Clock-in (MANDATORY blockchain)
curl -H "Authorization: Bearer [JWT]" -X POST http://localhost:5000/api/attendance/clock-in -d '{"date":"20241201"}'

# Verify
curl -H "Authorization: Bearer [JWT]" http://localhost:5000/api/attendance/verify/20241201
```

**Professor sees: LIVE transactions, gas costs, verification! 🔥**
