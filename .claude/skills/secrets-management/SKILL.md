---
name: secrets-management
description: Implement secure secrets management for CI/CD pipelines using Vault, AWS Secrets Manager, or native platform solutions. Use when handling sensitive credentials, rotating secrets, or securing CI/CD environments.
version: 1.0.0
---

# Secrets Management

Secure secrets management practices for CI/CD pipelines using Vault, AWS Secrets Manager, and other tools.

## When to Use This Skill

- Store API keys and credentials
- Manage database passwords
- Handle TLS certificates
- Rotate secrets automatically
- Implement least-privilege access

## Secrets Management Tools

| Tool | Description |
|------|-------------|
| HashiCorp Vault | Centralized, dynamic secrets, audit logging |
| AWS Secrets Manager | AWS-native, automatic rotation |
| Azure Key Vault | Azure-native, HSM-backed keys |
| Google Secret Manager | GCP-native, versioning |

## HashiCorp Vault

### Setup
```bash
vault secrets enable -path=secret kv-v2
vault kv put secret/database/config username=admin password=secret
```

### GitHub Actions with Vault
```yaml
- name: Import Secrets from Vault
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.example.com:8200
    token: ${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/database username | DB_USERNAME ;
      secret/data/database password | DB_PASSWORD
```

## AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password"
```

```yaml
- name: Get secret from AWS
  run: |
    SECRET=$(aws secretsmanager get-secret-value \
      --secret-id production/database/password \
      --query SecretString --output text)
    echo "::add-mask::$SECRET"
    echo "DB_PASSWORD=$SECRET" >> $GITHUB_ENV
```

## Secret Rotation

```python
def lambda_handler(event, context):
    client = boto3.client('secretsmanager')
    new_password = generate_strong_password()
    update_database_password(new_password)
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({'password': new_password})
    )
```

## Kubernetes External Secrets

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
  data:
  - secretKey: password
    remoteRef:
      key: database/config
      property: password
```

## Secret Scanning (Pre-commit)

```bash
#!/bin/bash
docker run --rm -v "$(pwd):/repo" \
  trufflesecurity/trufflehog:latest \
  filesystem --directory=/repo

if [ $? -ne 0 ]; then
  echo "Secret detected! Commit blocked."
  exit 1
fi
```

## Best Practices

1. **Never commit secrets** to Git
2. **Use different secrets** per environment
3. **Rotate secrets regularly**
4. **Implement least-privilege access**
5. **Enable audit logging**
6. **Use secret scanning** (GitGuardian, TruffleHog)
7. **Mask secrets in logs**
8. **Encrypt secrets at rest**
9. **Use short-lived tokens** when possible
10. **Document secret requirements**
