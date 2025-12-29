# Multi-Version Patch Support Guide

## Overview

The patch system now supports multiple versions of `biosensesignal-react-native-sdk`. The `apply-patches.sh` script automatically detects the version and applies the correct patch.

## Current Setup

- **Script**: `scripts/apply-patches.sh`
- **Patches Directory**: `patches/`
- **Current Patch**: `biosensesignal-react-native-sdk+5.9.3.patch`

## How It Works

1. The `postinstall` script runs `apply-patches.sh` after package installation
2. The script detects the SDK version from `package.json`
3. It looks for a matching patch file: `patches/biosensesignal-react-native-sdk+VERSION.patch`
4. If found, applies the patch; if not, shows a helpful message

## Supported Versions

Currently supported:
- ✅ **5.9.3** - Patch exists and working

To add support for new versions:
- ⚠️ **5.11.4** - Need to create patch
- ⚠️ **5.11.1** - Need to create patch

## Adding Support for a New Version

### Option 1: Using patch-package (Recommended)

```bash
# 1. Update package.json to use the new version
#    "biosensesignal-react-native-sdk": "./BiosenseSignal_ReactNative_SDK_5.11.4.tgz"

# 2. Install the new version
yarn install

# 3. Make your changes to node_modules/biosensesignal-react-native-sdk
#    (Apply the same changes you made for 5.9.3)

# 4. Generate the patch
npx patch-package biosensesignal-react-native-sdk

# 5. The patch will be created as:
#    patches/biosensesignal-react-native-sdk+5.11.4.patch
```

### Option 2: Manual Patch Creation

```bash
# 1. Install the new SDK version
yarn install

# 2. Make your changes to node_modules/biosensesignal-react-native-sdk

# 3. Create a backup of the original
cp -r node_modules/biosensesignal-react-native-sdk /tmp/original-sdk-5.11.4

# 4. Make your changes

# 5. Create patch using git diff
cd /tmp
mkdir patch-repo && cd patch-repo
git init
cp -r original-sdk-5.11.4/* .
git add -A
git commit -m "Original"
cp -r /path/to/your/project/node_modules/biosensesignal-react-native-sdk/* .
git add -A
git diff --cached > /path/to/your/project/patches/biosensesignal-react-native-sdk+5.11.4.patch
```

## Testing a New Version

1. Update `package.json` to use the new version
2. Run `yarn install`
3. Check if the patch applies:
   ```bash
   bash scripts/apply-patches.sh
   ```
4. If patch doesn't exist or fails, create it using the steps above

## Important Notes

- **Version-Specific**: Each patch is specific to a version. A patch for 5.9.3 will NOT work with 5.11.4.
- **Line Numbers**: Patches are based on line numbers and context. Code changes between versions will break patches.
- **Automatic Detection**: The script automatically detects the version from the `.tgz` filename in `package.json`.
- **Fallback**: If no patch is found for a version, the script will warn you but won't fail the install.

## Troubleshooting

### Patch not found for version X
- Create a patch for that version using the steps above
- Or update the script to handle the version detection better

### Patch fails to apply
- The code structure may have changed significantly
- You'll need to manually adapt the patch or create a new one

### Multiple patches needed
- You can have multiple patch files:
  - `patches/biosensesignal-react-native-sdk+5.9.3.patch`
  - `patches/biosensesignal-react-native-sdk+5.11.4.patch`
  - `patches/biosensesignal-react-native-sdk+5.11.1.patch`
- The script will automatically use the correct one



