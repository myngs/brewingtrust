# AI Anomaly Detection System - Complete Guide

## Overview

The AI Anomaly Detection system uses **Isolation Forest**, a machine learning algorithm that identifies unusual attendance patterns in your cafe's employee records. It analyzes clock-in/clock-out data to flag suspicious or irregular shifts for admin review.

---

## How It Works

### 1. **Data Collection**
The system reads attendance logs from two sources:
- **Off-chain storage**: JSON files stored in `server/data/` directory
- **Blockchain references**: Hashes stored on the blockchain for verification

Each attendance record contains:
- `employee_id`: Employee identifier
- `clock_in_time`: When the employee clocked in
- `clock_out_time`: When the employee clocked out

### 2. **Feature Engineering**

The system extracts **6 intelligent features** from each attendance record:

| Feature | Description | Purpose |
|---------|-------------|---------|
| `clock_in_hour` | Hour of day when employee clocked in (0-23) | Detects unusual start times |
| `clock_out_hour` | Hour of day when employee clocked out (0-23) | Detects unusual end times |
| `shift_length` | Total hours worked (calculated from clock-in/out) | Identifies unusually long/short shifts |
| `day_of_week` | Day of the week (0=Monday, 6=Sunday) | Accounts for weekend vs weekday patterns |
| `crosses_midnight` | Binary flag (1 if shift crosses midnight, 0 otherwise) | Flags night shifts or data errors |
| `shift_deviation` | Absolute difference from standard 8-hour shift | Measures deviation from normal work hours |

**Example:**
```
Employee clocks in at 3:00 AM and out at 12:00 PM
- clock_in_hour: 3
- clock_out_hour: 12
- shift_length: 9.0 hours
- day_of_week: 2 (Wednesday)
- crosses_midnight: 0
- shift_deviation: 1.0 (9 hours - 8 hours standard)
```

### 3. **Isolation Forest Algorithm**

**What is Isolation Forest?**
- A machine learning algorithm that detects anomalies by isolating outliers
- Works by randomly selecting features and split values
- Anomalies are isolated faster than normal points (fewer splits needed)
- Does NOT require labeled training data (unsupervised learning)

**How it detects anomalies:**
1. Builds 200 decision trees (`n_estimators=200`)
2. Each tree randomly selects features and thresholds
3. Calculates an "anomaly score" for each record
4. Records with extreme scores are flagged as anomalies

**Why it's effective:**
- ✅ Detects multi-dimensional patterns (not just single features)
- ✅ Robust to different shift patterns across employees
- ✅ Identifies combinations of unusual features (e.g., very early start + very long shift)
- ✅ Fast and scalable for large datasets

### 4. **Anomaly Scoring**

Each record receives:
- **Anomaly Flag**: `-1` (anomaly) or `1` (normal)
- **Anomaly Score**: Numerical score indicating how unusual the record is
  - Lower scores = more anomalous
  - Higher scores = more normal

**Contamination Rate**: Set to 5% by default
- Means the system expects ~5% of records to be anomalies
- Adjustable via `--contamination` parameter

### 5. **Output & Admin Review**

Flagged anomalies are displayed in the admin dashboard with:
- Employee ID
- Clock-in time
- Clock-out time
- Shift length
- Approve/Reject buttons for manual verification

---

## Examples of Detected Anomalies

### ✓ Detected Anomalies:
1. **Very early start**: Employee clocks in at 2:00 AM (unusual for cafe)
2. **Excessive overtime**: 14-hour shift when standard is 8 hours
3. **Midnight crossing**: Shift spans from 11 PM to 3 AM (potential data error)
4. **Inconsistent pattern**: Employee who normally works 8-5 suddenly works 12-8
5. **Missing clock-out**: Incomplete shift data

### ✗ Normal Patterns (Not Flagged):
- Standard 8-hour shifts (8 AM - 5 PM)
- Consistent daily patterns
- Reasonable variations (7.5 - 8.5 hours)
- Regular weekend shifts

---

## Configuration

### Command-Line Parameters

```bash
python anomaly_detection.py \
  --source offchain \
  --contamination 0.05 \
  --random-state 42
```

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `--source` | `offchain` | `offchain`, `sample`, `csv`, `json` | Data source |
| `--contamination` | `0.05` | 0.01 - 0.5 | Expected anomaly fraction |
| `--random-state` | `42` | Any integer | Reproducibility seed |
| `--input-path` | None | File path | Required for csv/json sources |

### Adjusting Sensitivity

**To detect MORE anomalies** (lower threshold):
```bash
--contamination 0.10  # Expect 10% anomalies instead of 5%
```

**To detect FEWER anomalies** (higher threshold):
```bash
--contamination 0.02  # Expect only 2% anomalies
```

---

## Improvements Made

### Previous Version:
- Used only 3 features: `clock_in_hour`, `clock_out_hour`, `shift_length`
- Limited context about shift patterns
- Could miss complex anomalies

### Enhanced Version:
- **+3 new features**: `day_of_week`, `crosses_midnight`, `shift_deviation`
- **Better context**: Understands weekly patterns and shift deviations
- **Improved accuracy**: Catches more sophisticated anomalies
- **Anomaly scores**: Provides confidence levels for each flag
- **More robust**: Handles edge cases like night shifts better

---

## Integration with Blockchain

### Data Flow:
```
Employee Clock-In/Out
        ↓
Off-Chain Storage (JSON)
        ↓
SHA-256 Hash Generated
        ↓
Hash Stored on Blockchain
        ↓
AI Reads Off-Chain Data
        ↓
Anomaly Detection
        ↓
Admin Review & Approval
```

### Security Benefits:
- ✅ Immutable record of hashes on blockchain
- ✅ Off-chain data can be verified against blockchain hash
- ✅ Tamper-proof audit trail
- ✅ AI analysis doesn't modify blockchain

---

## Output Files

### `anomaly_results.csv`
Located in `AI/` directory after each scan:

```csv
employee_id,clock_in_time,clock_out_time,clock_in_hour,clock_out_hour,shift_length,day_of_week,crosses_midnight,shift_deviation,anomaly_flag,anomaly_score
E123,2026-03-14T08:05:00,2026-03-14T17:00:00,8,17,8.92,5,0,0.92,1,0.45
E124,2026-03-14T03:00:00,2026-03-14T12:00:00,3,12,9.0,5,0,1.0,-1,-0.82
```

- `anomaly_flag = 1`: Normal record
- `anomaly_flag = -1`: Flagged anomaly
- `anomaly_score`: Confidence level (lower = more anomalous)

---

## Performance Metrics

### Algorithm Characteristics:
- **Time Complexity**: O(n log n) - very efficient
- **Space Complexity**: O(n) - minimal memory usage
- **Scalability**: Handles 10,000+ records easily
- **Training Time**: < 1 second for typical datasets

### Accuracy Factors:
- Dataset size (more data = better patterns)
- Contamination rate (should match actual anomaly percentage)
- Feature quality (accurate clock times are critical)

---

## Troubleshooting

### Issue: "No anomalies flagged"
**Solution**: 
- Increase `--contamination` to 0.10
- Check if data is too uniform
- Verify attendance data exists in `server/data/`

### Issue: "Too many false positives"
**Solution**:
- Decrease `--contamination` to 0.02
- Review flagged records for patterns
- Adjust based on business rules

### Issue: "Python not found"
**Solution**:
- Set `PYTHON_BIN` in `server/.env`
- Example: `PYTHON_BIN=/usr/bin/python3`

---

## Best Practices

1. **Regular Scans**: Run AI scan weekly to catch patterns early
2. **Review Flagged Records**: Don't auto-approve; always review manually
3. **Adjust Sensitivity**: Fine-tune contamination rate based on your data
4. **Monitor Trends**: Track which employees get flagged most often
5. **Document Approvals**: Keep records of approved anomalies for audit trail

---

## Technical Details

### Isolation Forest Implementation:
```python
model = IsolationForest(
    contamination=0.05,      # 5% expected anomalies
    random_state=42,         # Reproducible results
    n_estimators=200,        # 200 decision trees
    max_samples="auto",      # Automatic sample size
    max_features=1.0         # Use all features
)
```

### Feature Normalization:
- Features are automatically scaled by scikit-learn
- No manual normalization needed
- Handles different feature ranges automatically

---

## Future Enhancements

Potential improvements:
- [ ] Employee-specific baselines (personalized anomaly detection)
- [ ] Seasonal adjustments (different patterns for different seasons)
- [ ] Real-time anomaly detection (flag immediately on clock-out)
- [ ] Integration with HR system for context
- [ ] Automated approval for low-risk anomalies
- [ ] Predictive analytics for shift planning

---

## Support & Questions

For issues or questions:
1. Check the troubleshooting section above
2. Review the sample data in `--source sample`
3. Verify data format matches expected schema
4. Check `server/.env` for Python configuration

---

**Last Updated**: 2026-03-18
**Algorithm**: Isolation Forest (scikit-learn)
**Version**: 2.0 (Enhanced with 6-feature detection)
