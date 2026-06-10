# Contributing to VaultDB

## Branch Workflow

```
main          ← stable, protected
 └── dev      ← integration branch
      └── feat/your-feature  ← your work
```

1. Fork the repo and clone locally
2. Branch off `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/your-feature-name
   ```
3. Make your changes
4. Open a PR from your branch → `dev`

## Commit Style

```
feat(core): add write-ahead logging
fix(infra): resolve config env override
docs: update contributing guide
```

## Code Areas

| Area | Location | Purpose |
|------|----------|---------|
| Core | `core/` | Storage engine, query layer, transactions |
| Infrastructure | `infrastructure/` | Config, logging, networking, deployment |
