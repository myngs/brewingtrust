# Part B — Unit Testing for Secure Functions

## Task 1: Password Validation

### Vulnerable Code

```
python
def validate_password(password):
    return len(password) > 3
```

---

### Question 1: What is the security issue?

The password validation only checks if the password is longer than 3 characters. This is extremely weak and vulnerable because:

1. **No minimum length enforcement** - Only requires >3 characters (4+), should be at least 8
2. **No complexity requirements** - Doesn't check for uppercase, lowercase, numbers, or special characters
3. **Easily brute-forced** - Short passwords can be easily cracked

---

### Question 2: Write a unit test that exposes the flaw

```
python
def test_short_password():
    assert validate_password("1234") == False
```

This test will **FAIL** because the current vulnerable code returns `True` for "1234" (since len("1234") = 4 > 3), but a secure password should require more complexity than just length.

---

### Question 3: Fixed Code

```
python
def validate_password(password):
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.islower() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for c in password):
        return False
    return True
```

---

### Expected Secure Behavior

1. **Minimum length of 8 characters** - Passwords shorter than 8 are rejected
2. **At least one uppercase letter** - Ensures mixed case complexity
3. **At least one lowercase letter** - Ensures mixed case complexity
4. **At least one digit** - Ensures numeric characters are included
5. **At least one special character** - Ensures symbols are included for increased entropy

---

## Task 2: SQL Injection Check

### Vulnerable Code

```
python
def find_user(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return db.execute(query)
```

### Manual Test Input

```
' OR '1'='1
```

If login succeeds → vulnerable.

---

### Question 1: What vulnerability exists?

This is a **SQL Injection vulnerability**. The code directly concatenates user input into the SQL query without any sanitization or parameterization. An attacker can inject malicious SQL code through the username parameter to:

- Bypass authentication
- Extract sensitive data
- Modify or delete database records
- Execute administrative operations

---

### Question 2: What type of test should detect it?

**Input Validation Test** / **Security Penetration Test**

A unit test that attempts SQL injection payloads should detect this vulnerability:

```
python
def test_sql_injection():
    result = find_user("' OR '1'='1")
    # Should NOT return all users or bypass authentication
    assert result is None or len(result) == 0
```

This test will **FAIL** with the vulnerable code (returns all users due to the injected OR condition).

---

### Question 3: Fixed Code (Parameterized Query)

```
python
def find_user(username):
    query = "SELECT * FROM users WHERE username = %s"
    return db.execute(query, (username,))
```

Using parameterized queries (or prepared statements) ensures user input is treated as data, not executable SQL code.

---

### Expected Secure Behavior

1. **Input is treated as literal data** - User input cannot alter query structure
2. **SQL injection payloads are harmless** - Malicious input is escaped automatically
3. **Database properly sanitizes input** - The database driver handles escaping
