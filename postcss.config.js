module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Click **"Commit changes"** → **"Commit changes"**

---

### FILE 6: `.gitignore`

**Click "Add file" → "Create new file"**

**In the name box type**: `.gitignore`

**Copy and paste**:
```
node_modules
.next
out
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts
