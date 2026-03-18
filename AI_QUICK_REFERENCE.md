# Quick Reference - AI Anomaly Detection

## What is the AI System?

The AI system automatically detects unusual employee attendance patterns using machine learning. It analyzes clock-in/clock-out times and flags suspicious records for admin review.

---

## How Does It Work? (Simple Explanation)

### Step 1: Collect Data
- Reads employee clock-in and clock-out times
- Stores data in JSON files (off-chain)
- Hashes stored on blockchain for verification

### Step 2: Extract Features
The system looks at 6 different aspects of each shift:

```
1. What time did they clock in? (3 AM? 8 AM? 2 PM?)
2. What time did they clock out? (5 PM? 12 AM? 3 AM?)
3. How long was the shift? (4 hours? 8 hours? 14 hours?)
4. What day of the week? (Monday? Saturday?)
5. Did the shift cross midnight? (Yes/No)
6. How far from 8-hour standard? (1 hour more? 2 hours less?)
```

### Step 3: Find Anomalies
- Uses "Isolation Forest" algorithm
- Looks for unusual combinations of features
- Assigns each record a "suspicion score"
- Flags records that don't fit normal patterns

### Step 4: Admin Review
- Admins see flagged records in dashboard
- Can approve (legitimate) or reject (error)
- Records stored on blockchain for audit trail

---

## What Gets Flagged?

### ✓ Likely to be Flagged:
- ⏰ Very early start (2 AM, 3 AM)
- ⏰ Very late end (11 PM, 12 AM)
- ⏰ Extremely long shift (14+ hours)
- ⏰ Extremely short shift (1-2 hours)
- ⏰ Shift crosses midnight (11 PM to 3 AM)
- ⏰ Unusual pattern for that employee

### ✗ Unlikely to be Flagged:
- ✓ Standard 8-hour shifts (8 AM - 5 PM)
- ✓ Consistent daily patterns
- ✓ Minor variations (7.5 - 8.5 hours)
- ✓ Regular weekend shifts

---

## Running the AI Scan

### From Admin Dashboard:
1. Go to "AI Anomaly Detection" page
2. Click "Run AI Scan" button
3. Wait for results (usually < 1 second)
4. Review flagged records
5. Click "Approve" or "Reject" for each

### From Command Line:
```bash
cd d:\Coding\HTML\Trust Brew\Main Code
python AI/anomaly_detection.py --source offchain
```

### Output:
- Results saved to: `AI/anomaly_results.csv`
- Displayed in admin dashboard
- Shows employee ID, times, and anomaly score

---

## Understanding Anomaly Scores

### Anomaly Flag:
- `1` = Normal record (no action needed)
- `-1` = Flagged as anomaly (review needed)

### Anomaly Score:
- Lower score = More suspicious
- Higher score = More normal
- Range: -1.0 to +1.0 (approximately)

### Example:
```
Employee A: anomaly_score = -0.85 (very suspicious)
Employee B: anomaly_score = -0.15 (slightly unusual)
Employee C: anomaly_score = +0.45 (normal)
```

---

## Configuration

### Adjust Sensitivity:

**More Sensitive** (catch more anomalies):
```bash
python AI/anomaly_detection.py --contamination 0.10
```
- Flags ~10% of records instead of 5%
- More false positives
- Better for strict monitoring

**Less Sensitive** (fewer false alarms):
```bash
python AI/anomaly_detection.py --contamination 0.02
```
- Flags ~2% of records instead of 5%
- Fewer false positives
- Only catches obvious anomalies

---

## Features Explained

### 1. Clock-In Hour
**What**: What hour of the day did they clock in?
**Example**: 8 (8 AM), 14 (2 PM), 3 (3 AM)
**Why**: Unusual times might indicate errors or suspicious activity

### 2. Clock-Out Hour
**What**: What hour of the day did they clock out?
**Example**: 17 (5 PM), 22 (10 PM), 0 (midnight)
**Why**: Unusual end times might indicate overtime or data errors

### 3. Shift Length
**What**: Total hours worked
**Example**: 8.0, 9.5, 14.0
**Why**: Very long or short shifts are unusual

### 4. Day of Week
**What**: Which day was this shift?
**Example**: 0 (Monday), 5 (Saturday), 6 (Sunday)
**Why**: Weekend patterns differ from weekdays

### 5. Crosses Midnight
**What**: Did the shift span from one day to the next?
**Example**: 1 (yes, crosses midnight), 0 (no)
**Why**: Night shifts are unusual for a cafe

### 6. Shift Deviation
**What**: How far from the standard 8-hour shift?
**Example**: 0.0 (exactly 8 hours), 1.5 (7.5 or 8.5 hours)
**Why**: Measures deviation from normal work hours

---

## Real-World Examples

### Example 1: Legitimate Anomaly
```
Employee: John Doe
Clock In: 3:00 AM
Clock Out: 12:00 PM
Shift: 9 hours
Day: Friday
Crosses Midnight: No
Deviation: 1 hour

Anomaly Score: -0.72 (FLAGGED)
Reason: Very unusual start time (3 AM) + longer shift
Action: Admin reviews → Approves (special event setup)
```

### Example 2: False Positive
```
Employee: Maria Santos
Clock In: 8:00 AM
Clock Out: 5:00 PM
Shift: 9 hours
Day: Monday
Crosses Midnight: No
Deviation: 1 hour

Anomaly Score: -0.15 (FLAGGED)
Reason: Slightly longer than usual
Action: Admin reviews → Rejects (normal variation)
```

### Example 3: Normal Record
```
Employee: Ahmed Hassan
Clock In: 8:00 AM
Clock Out: 5:00 PM
Shift: 8.92 hours
Day: Wednesday
Crosses Midnight: No
Deviation: 0.92 hours

Anomaly Score: +0.45 (NOT FLAGGED)
Reason: Standard shift, normal pattern
Action: No review needed
```

---

## Troubleshooting

### Problem: "No anomalies flagged"
**Possible Causes**:
- Data is too uniform (everyone works same hours)
- Contamination rate too low
- Not enough data to analyze

**Solution**:
- Increase `--contamination 0.10`
- Collect more attendance data
- Check if data is realistic

### Problem: "Too many false positives"
**Possible Causes**:
- Contamination rate too high
- Legitimate variations being flagged
- Different shift patterns for different roles

**Solution**:
- Decrease `--contamination 0.02`
- Review flagged records for patterns
- Consider employee-specific baselines

### Problem: "Python not found"
**Solution**:
1. Open `server/.env`
2. Add: `PYTHON_BIN=/path/to/python3`
3. Restart server

---

## Best Practices

### ✓ Do:
- Run scans regularly (weekly recommended)
- Review all flagged records manually
- Document approved anomalies
- Adjust sensitivity based on your data
- Keep audit trail of approvals

### ✗ Don't:
- Auto-approve all flagged records
- Ignore the AI system
- Use as sole basis for discipline
- Forget to verify blockchain hashes
- Change contamination rate too frequently

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Algorithm | Isolation Forest |
| Features | 6 (enhanced) |
| Decision Trees | 200 |
| Default Contamination | 5% |
| Processing Time | < 1 second |
| Scalability | 10,000+ records |

---

## Integration with Blockchain

### Why Blockchain?
- ✅ Immutable record of attendance hashes
- ✅ Tamper-proof audit trail
- ✅ Verification of off-chain data
- ✅ Compliance and transparency

### Data Flow:
```
Clock In/Out → Off-Chain JSON → SHA-256 Hash → Blockchain
                                      ↓
                            AI Reads Off-Chain
                                      ↓
                            Anomaly Detection
                                      ↓
                            Admin Review
                                      ↓
                            Approval → Blockchain
```

---

## Output Files

### `anomaly_results.csv`
Located in `AI/` directory after each scan.

**Columns**:
- `employee_id`: Employee identifier
- `clock_in_time`: ISO format timestamp
- `clock_out_time`: ISO format timestamp
- `clock_in_hour`: Hour of day (0-23)
- `clock_out_hour`: Hour of day (0-23)
- `shift_length`: Hours worked
- `day_of_week`: Day number (0-6)
- `crosses_midnight`: 0 or 1
- `shift_deviation`: Hours from 8-hour standard
- `anomaly_flag`: 1 (normal) or -1 (anomaly)
- `anomaly_score`: Confidence score

---

## Support

### For More Information:
- See: `AI_ANOMALY_DETECTION_GUIDE.md` (detailed guide)
- See: `CHANGES_SUMMARY.md` (all updates)
- Check: `server/.env` (configuration)

### Common Questions:

**Q: Can I adjust how sensitive the AI is?**
A: Yes, use `--contamination` parameter (0.02 to 0.10)

**Q: How often should I run scans?**
A: Weekly recommended, or after major events

**Q: What if I disagree with a flag?**
A: Click "Reject" - your feedback helps improve the system

**Q: Is the data secure?**
A: Yes, hashes stored on blockchain, off-chain data encrypted

---

**Last Updated**: 2026-03-18
**Version**: 2.0 (Enhanced)
**Status**: ✅ Ready to Use
