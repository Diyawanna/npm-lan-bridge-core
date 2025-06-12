# Publishing Guide for @diyawanna/lan-bridge-core

## Prerequisites

Before publishing your npm module, you need to:

1. **Create an npm account**: Visit [npmjs.com](https://www.npmjs.com) and create an account
2. **Login to npm**: Run `npm login` in your terminal and enter your credentials
3. **Verify your email**: Make sure your npm account email is verified

## Step-by-Step Publishing Process

### 1. Prepare Your Module

Ensure all files are in place:
```bash
cd /home/ubuntu/lan-bridge-module
ls -la
```

You should see:
- `package.json` - Module configuration
- `index.js` - Main server file
- `client.js` - Client library
- `react-component.jsx` - React component
- `README.md` - Documentation
- `LICENSE` - MIT license
- `mobile-integration.md` - Mobile integration guide

### 2. Test Your Module Locally

Before publishing, test your module:

```bash
# Install dependencies
npm install

# Test the server
npm start
```

### 3. Check Package Contents

Verify what will be published:
```bash
npm pack --dry-run
```

This shows you exactly what files will be included in your package.

### 4. Publish to npm

```bash
# First time publishing
npm publish --access public

# For updates (increment version first)
npm version patch  # or minor, major
npm publish
```

### 5. Verify Publication

After publishing, verify your package:
```bash
npm view @diyawanna/lan-bridge-core
```

## Version Management

Follow semantic versioning (semver):
- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
npm version patch   # Bug fixes
npm version minor   # New features
npm version major   # Breaking changes
```

## Testing Your Published Module

After publishing, test installation:

```bash
# Create a test directory
mkdir test-installation
cd test-installation
npm init -y

# Install your published module
npm install @diyawanna/lan-bridge-core

# Test basic functionality
node -e "const LANBridge = require('@diyawanna/lan-bridge-core'); console.log('Module loaded successfully');"
```

## Common Issues and Solutions

### 1. Package Name Already Exists
If `@diyawanna/lan-bridge-core` is taken, try:
- `@yourusername/lan-bridge-core`
- `@diyawanna/lan-bridge-core-v2`
- `lan-bridge-diyawanna`

### 2. Authentication Issues
```bash
npm logout
npm login
```

### 3. Scope Issues
For scoped packages (@diyawanna/...), ensure you have permission to publish under that scope.

### 4. File Size Issues
If your package is too large:
```bash
# Check package size
npm pack
ls -lh *.tgz

# Use .npmignore to exclude unnecessary files
echo "test/" >> .npmignore
echo "examples/" >> .npmignore
```

## Updating Your Module

When you make changes:

1. **Update the code**
2. **Test thoroughly**
3. **Update version**: `npm version patch/minor/major`
4. **Update README** if needed
5. **Publish**: `npm publish`

## Best Practices

1. **Test before publishing**: Always test your module locally
2. **Use semantic versioning**: Follow semver guidelines
3. **Write good documentation**: Clear README with examples
4. **Include TypeScript definitions**: Add `.d.ts` files for TypeScript support
5. **Add tests**: Include unit tests for reliability
6. **Use .npmignore**: Exclude unnecessary files from the package

## Example .npmignore File

```
# Development files
test/
tests/
*.test.js
*.spec.js

# Documentation
docs/
examples/

# Build files
src/
.babelrc
webpack.config.js

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

## Monitoring Your Package

After publishing:

1. **Check download stats**: Visit your package page on npmjs.com
2. **Monitor issues**: Watch for GitHub issues or npm feedback
3. **Update regularly**: Keep dependencies updated
4. **Respond to community**: Answer questions and fix bugs

## Next Steps

After successful publication:

1. **Create GitHub repository**: Host your code on GitHub
2. **Add CI/CD**: Set up automated testing and publishing
3. **Write blog post**: Share your module with the community
4. **Submit to awesome lists**: Get more visibility
5. **Gather feedback**: Listen to user feedback and improve

Your module is now ready to be published and shared with the world!

