# TODO List

## Task 1: Remove wallet address from signup

- [x] client/app/signup/page.tsx - Remove walletAddress from form state
- [x] client/app/signup/page.tsx - Remove wallet address input field from UI
- [x] client/app/signup/page.tsx - Remove walletAddress from API request body
- [x] server/routes/authRoutes.js - Remove walletAddress from destructured req.body
- [x] server/routes/authRoutes.js - Remove wallet address validation
- [x] server/routes/authRoutes.js - Remove walletAddress when creating new User

## Task 2: Make blockchain page load data from previous dates

- [x] client/app/blockchain/page.tsx - Add date picker/selector component
- [x] client/app/blockchain/page.tsx - Add state for selected date
- [x] client/app/blockchain/page.tsx - Add function to fetch records for selected date
- [x] client/app/blockchain/page.tsx - Update fetch logic to use selected date instead of today
- [x] client/app/blockchain/page.tsx - Update table to show records for selected date

## Task 3: Fetch attendance data from MongoDB

- [x] server/routes/attendanceRoutes.js - Add /my-records endpoint to get all attendance for current user
- [x] client/app/blockchain/page.tsx - Add fetchAllRecords function to call the new API
- [x] client/app/blockchain/page.tsx - Add historical records table to display all past attendance
- [x] client/app/blockchain/page.tsx - Refresh records after clock in/out operations
