---
name: security-requirement-extraction
description: Derive security requirements from threat models and business context. Use when translating threats into actionable requirements, creating security user stories, or building security test cases.
version: 1.0.0
---

# Security Requirement Extraction

Transform threat analysis into actionable security requirements.

## When to Use This Skill

- Converting threat models to requirements
- Writing security user stories
- Creating security test cases
- Building security acceptance criteria
- Compliance requirement mapping
- Security architecture documentation

## Core Concepts

### Requirement Flow

```
Business Requirements → Security Requirements → Technical Controls
         ↓                       ↓                      ↓
  "Protect customer    "Encrypt PII at rest"   "AES-256 encryption
   data"                                        with KMS key rotation"
```

### Security Requirement Types

| Type | Focus | Example |
|------|-------|---------|
| **Functional** | What system must do | "System must authenticate users" |
| **Non-functional** | How system must perform | "Authentication must complete in <2s" |
| **Constraint** | Limitations imposed | "Must use approved crypto libraries" |

### Requirement Attributes

| Attribute | Description |
|-----------|-------------|
| **Traceability** | Links to threats/compliance |
| **Testability** | Can be verified |
| **Priority** | Business importance |
| **Risk Level** | Impact if not met |

## STRIDE to Requirements Mapping

### Spoofing → Authentication

**Domains:** Authentication, Session Management

**Requirement Patterns:**
- Implement strong authentication for {target}
- Validate identity tokens for {target}
- Implement session management for {target}

**Acceptance Criteria:**
- Users must authenticate before access
- Authentication failures are logged
- Multi-factor available for sensitive operations

### Tampering → Data Integrity

**Domains:** Input Validation, Data Protection

**Requirement Patterns:**
- Validate all input to {target}
- Implement integrity checks for {target}
- Protect {target} from modification

**Test Cases:**
- Invalid input is rejected
- Tampered data is detected
- SQL injection attempts are blocked

### Repudiation → Audit Logging

**Domains:** Audit Logging

**Requirement Patterns:**
- Log all security events for {target}
- Implement non-repudiation for {target}
- Protect audit logs for {target}

### Information Disclosure → Data Protection

**Domains:** Data Protection, Cryptography

**Requirement Patterns:**
- Encrypt sensitive data in {target}
- Implement access controls for {target}
- Prevent information leakage from {target}

### Denial of Service → Availability

**Domains:** Availability, Input Validation

**Requirement Patterns:**
- Implement rate limiting for {target}
- Ensure availability under high load
- Implement resource quotas for {target}

### Elevation of Privilege → Authorization

**Domains:** Authorization

**Requirement Patterns:**
- Enforce authorization for {target}
- Implement least privilege for {target}
- Validate permissions server-side

## Security User Story Template

```markdown
## SR-001: {Title}

**User Story:**
As a {security role},
I want the system to {security capability},
So that {security benefit}.

**Priority:** Critical | High | Medium | Low
**Domain:** Authentication | Authorization | Data Protection | ...

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Definition of Done:**
- [ ] Implementation complete
- [ ] Security tests pass
- [ ] Code review complete
- [ ] Security review approved
- [ ] Documentation updated

**Security Test Cases:**
- Test 1: Unauthorized access is denied
- Test 2: Invalid input is rejected
- Test 3: Audit logs are created

**Traceability:**
- Threats: THREAT-001, THREAT-002
- Compliance: PCI-DSS 8.1, GDPR Art. 32
```

## Compliance Mapping

### Framework Controls

| Framework | Authentication | Authorization | Data Protection | Audit |
|-----------|---------------|---------------|-----------------|-------|
| PCI-DSS | 8.1, 8.2, 8.3 | 7.1, 7.2 | 3.4, 3.5, 4.1 | 10.1-10.3 |
| HIPAA | 164.312(d) | 164.312(a)(1) | 164.312(a)(2)(iv) | 164.312(b) |
| GDPR | - | Art. 25 | Art. 32, Art. 25 | Art. 30 |
| OWASP ASVS | V2.1-V2.3 | V4.1-V4.3 | V8.1-V8.3 | V7.1-V7.2 |

### Gap Analysis

```markdown
## Compliance Gap Analysis: PCI-DSS

### Missing Controls
- PCI-DSS 8.3: Multi-factor authentication not implemented
- PCI-DSS 10.2: Audit logging incomplete

### Weak Coverage
- PCI-DSS 3.4: Encryption key rotation manual

### Recommended Actions
1. Implement MFA for all admin access (P0)
2. Complete audit logging coverage (P0)
3. Automate key rotation (P1)
```

## Priority Calculation

```
Priority = Impact × Likelihood

Impact:    LOW=1, MEDIUM=2, HIGH=3, CRITICAL=4
Likelihood: LOW=1, MEDIUM=2, HIGH=3, CRITICAL=4

Score ≥ 12: CRITICAL
Score ≥ 6:  HIGH
Score ≥ 3:  MEDIUM
Score < 3:  LOW
```

## Best Practices

### Do's
- **Trace to threats** - Every requirement should map to threats
- **Be specific** - Vague requirements can't be tested
- **Include acceptance criteria** - Define "done"
- **Consider compliance** - Map to frameworks early
- **Review regularly** - Requirements evolve with threats

### Don'ts
- **Don't be generic** - "Be secure" is not a requirement
- **Don't skip rationale** - Explain why it matters
- **Don't ignore priorities** - Not all requirements are equal
- **Don't forget testability** - If you can't test it, you can't verify it
- **Don't work in isolation** - Involve stakeholders

## Resources

- OWASP ASVS
- NIST SP 800-53
- Security User Stories (O'Reilly)
