#!/bin/bash
set -e

REPO="ltaoo/sponsorkit"
BINARY="wx_video_download"

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
if [ "$OS" != "linux" ]; then
    echo "Error: This script only supports Linux."
    exit 1
fi

# Detect Arch
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        ARCH="x86_64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo "Error: Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# Get latest release tag
echo "Fetching latest version..."
LATEST_URL=$(curl -sL -o /dev/null -w %{url_effective} "https://github.com/$REPO/releases/latest")
VERSION=$(basename "$LATEST_URL")

if [ -z "$VERSION" ]; then
    echo "Error: Could not determine latest version."
    exit 1
fi

echo "Latest version: $VERSION"

# Construct download URL
FILENAME="${BINARY}_${VERSION}_${OS}_${ARCH}.tar.gz"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/$FILENAME"

# Create temp directory
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Download
echo "Downloading $DOWNLOAD_URL..."
curl -sL "$DOWNLOAD_URL" -o "$TMP_DIR/$FILENAME"

# Extract
echo "Extracting..."
tar -xzf "$TMP_DIR/$FILENAME" -C "$TMP_DIR"

# Install
INSTALL_DIR="/usr/local/bin"
echo "Installing to $INSTALL_DIR..."
if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/"
else
    sudo mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/"
fi

echo "Successfully installed $BINARY to $INSTALL_DIR/$BINARY"
