#!/bin/bash

echo "🎁 Creating BillBook.dmg manually..."

# Build the application first
echo "🔨 Building the React application..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed. Please check the build process."
    exit 1
fi

echo "📦 Creating application bundle..."

# Create app structure
APP_NAME="BillBook.app"
CONTENTS_DIR="$APP_NAME/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

# Clean up any existing app
rm -rf "$APP_NAME"

# Create directory structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Copy the built web app
cp -r dist/* "$RESOURCES_DIR/"

# Copy the app icon
if [ -f "src/assets/images/bb_icon.png" ]; then
    cp "src/assets/images/bb_icon.png" "$RESOURCES_DIR/icon.png"
fi

# Create executable shell script
cat > "$MACOS_DIR/BillBook" << 'EOF'
#!/bin/bash
# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
RESOURCES_DIR="$DIR/../Resources"

# Check if backend is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "Starting backend server..."
    # Try to start backend from the expected location
    BACKEND_DIR="../../../backend"
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        nohup npm run dev > /dev/null 2>&1 &
        # Wait for backend to start
        for i in {1..30}; do
            if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
                break
            fi
            sleep 1
        done
    fi
fi

# Open the app in the default browser
open "http://localhost:3000" || open "$RESOURCES_DIR/index.html"
EOF

chmod +x "$MACOS_DIR/BillBook"

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>BillBook</string>
    <key>CFBundleIdentifier</key>
    <string>com.billbook.app</string>
    <key>CFBundleName</key>
    <string>BillBook</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>icon.png</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.10</string>
</dict>
</plist>
EOF

echo "✅ Application bundle created: $APP_NAME"

# Create DMG
echo "💿 Creating DMG file..."
DMG_NAME="BillBook-Installer.dmg"
rm -f "$DMG_NAME"

# Create a temporary directory for DMG contents
DMG_DIR="dmg-contents"
rm -rf "$DMG_DIR"
mkdir "$DMG_DIR"

# Copy app to DMG directory
cp -r "$APP_NAME" "$DMG_DIR/"

# Create Applications symlink
ln -s /Applications "$DMG_DIR/Applications"

# Create DMG
hdiutil create -volname "BillBook Installer" -srcfolder "$DMG_DIR" -ov -format UDZO "$DMG_NAME"

if [ -f "$DMG_NAME" ]; then
    echo "🎉 DMG created successfully: $DMG_NAME"
    echo "📍 Location: $(pwd)/$DMG_NAME"
    # Clean up
    rm -rf "$DMG_DIR"
    echo ""
    echo "🚀 To install BillBook:"
    echo "1. Double-click $DMG_NAME"
    echo "2. Drag BillBook.app to Applications folder"
    echo "3. Launch BillBook from Applications"
    echo ""
    echo "⚠️  Note: Make sure the backend server is running on port 3000"
    echo "   You can start it by running 'npm run dev' in the backend directory"
else
    echo "❌ Failed to create DMG"
    exit 1
fi