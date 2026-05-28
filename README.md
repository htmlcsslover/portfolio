# Raphael Portfolio

## Push and Deploy Latest Git

Use this workflow from the repository root:

```bash
git status --short --branch
git fetch origin
git rebase origin/main
git status --short
git add .
git commit -m "Describe the change"
git push origin main
npm.cmd run build
npx -y firebase-tools@latest deploy --only hosting
```

Notes:

- `git fetch origin` and `git rebase origin/main` make sure the local branch is based on the latest remote `main` before pushing.
- `npm.cmd run build` creates the production build in `client/dist`.
- `npx -y firebase-tools@latest deploy --only hosting` deploys the contents of `client/dist` according to `firebase.json`.
