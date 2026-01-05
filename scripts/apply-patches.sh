#!/bin/bash
# Script to apply patches for biosensesignal-react-native-sdk
# Automatically detects version and applies the correct patch

set -e

PACKAGE_DIR="node_modules/biosensesignal-react-native-sdk"
PATCHES_DIR="patches"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "Package not found, skipping patch application"
  exit 0
fi

# Get the version from package.json
TGZ_PATH=$(node -p "require('./package.json').dependencies['biosensesignal-react-native-sdk']" 2>/dev/null || echo "")

# Extract version from .tgz filename (e.g., "./BiosenseSignal_ReactNative_SDK_5.9.3.tgz" -> "5.9.3")
if [[ "$TGZ_PATH" == *"5.9.3"* ]]; then
  VERSION="5.9.3"
elif [[ "$TGZ_PATH" == *"5.11.4"* ]]; then
  VERSION="5.11.4"
elif [[ "$TGZ_PATH" == *"5.11.1"* ]]; then
  VERSION="5.11.1"
else
  # Try to extract version number from filename pattern
  VERSION=$(echo "$TGZ_PATH" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  if [ -z "$VERSION" ]; then
    # Default to 5.9.3 if we can't determine
    VERSION="5.9.3"
  fi
fi

PATCH_FILE="$PATCHES_DIR/biosensesignal-react-native-sdk+${VERSION}.patch"

echo "Attempting to apply patch for version: $VERSION"
echo "Patch file: $PATCH_FILE"

if [ -f "$PATCH_FILE" ]; then
  echo "Applying patch..."
  cd "$PACKAGE_DIR"
  patch -p1 -N < "../../$PATCH_FILE" 2>/dev/null || true
  cd ../..
  echo "✅ Patch applied (or already applied)"
else
  echo "⚠️  No patch file found for version $VERSION"
  echo "   Looking for: $PATCH_FILE"
  echo "   Available patches:"
  ls -1 "$PATCHES_DIR"/biosensesignal-react-native-sdk+*.patch 2>/dev/null || echo "   (none found)"
  echo ""
  echo "   To create a patch for this version:"
  echo "   1. Make your changes to node_modules/biosensesignal-react-native-sdk"
  echo "   2. Run: npx patch-package biosensesignal-react-native-sdk"
  echo "   3. Or manually create patch using git diff"
fi

exit 0

