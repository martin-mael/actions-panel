#!/bin/bash
set -e

REPO="martin-mael/actions-panel"
INSTALL_DIR="${HOME}/.local/bin"
BINARY_NAME="gh-actions-panel"

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
case "$OS" in
  darwin) OS="darwin" ;;
  linux) OS="linux" ;;
  *)
    echo "Error: Unsupported OS: $OS"
    echo "gh-actions-panel only supports macOS and Linux."
    exit 1
    ;;
esac

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *)
    echo "Error: Unsupported architecture: $ARCH"
    echo "gh-actions-panel only supports x64 and arm64 architectures."
    exit 1
    ;;
esac

ASSET_NAME="${BINARY_NAME}-${OS}-${ARCH}"

echo "Detected platform: ${OS}-${ARCH}"

# Get latest release tag
echo "Fetching latest release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)

if [ -z "$LATEST" ]; then
  echo "Error: Could not determine latest release."
  exit 1
fi

echo "Latest version: ${LATEST}"

# Download URL
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST}/${ASSET_NAME}"

# Create install directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download binary
echo "Downloading ${ASSET_NAME}..."
if ! curl -fsSL "$DOWNLOAD_URL" -o "${INSTALL_DIR}/${BINARY_NAME}"; then
  echo "Error: Failed to download binary from ${DOWNLOAD_URL}"
  exit 1
fi

# Make executable
chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

echo ""
echo "Successfully installed ${BINARY_NAME} ${LATEST} to ${INSTALL_DIR}/${BINARY_NAME}"

# Check if install directory is in PATH
if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
  echo ""
  echo "Note: ${INSTALL_DIR} is not in your PATH."
  echo "Add it to your shell profile with:"
  echo ""
  echo "  echo 'export PATH=\"\${HOME}/.local/bin:\${PATH}\"' >> ~/.bashrc"
  echo "  # or for zsh:"
  echo "  echo 'export PATH=\"\${HOME}/.local/bin:\${PATH}\"' >> ~/.zshrc"
  echo ""
  echo "Then restart your shell or run: source ~/.bashrc (or ~/.zshrc)"
else
  echo ""
  echo "Run 'gh-actions-panel' to get started."
fi
