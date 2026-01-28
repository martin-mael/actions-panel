# gh-actions-panel

A TUI for monitoring GitHub Actions workflows.

## Installation

### Quick Install (macOS & Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/martin-mael/actions-panel/main/install.sh | bash
```

This will:
- Detect your OS and architecture
- Download the latest release binary
- Install to `~/.local/bin/`

### Manual Installation

Download the appropriate binary from the [releases page](https://github.com/martin-mael/actions-panel/releases):

| Platform | Architecture | Binary |
|----------|--------------|--------|
| macOS    | Apple Silicon (M1/M2/M3) | `gh-actions-panel-darwin-arm64` |
| macOS    | Intel | `gh-actions-panel-darwin-x64` |
| Linux    | x64 | `gh-actions-panel-linux-x64` |
| Linux    | ARM64 | `gh-actions-panel-linux-arm64` |

Then make it executable and move to your PATH:

```bash
chmod +x gh-actions-panel-*
mv gh-actions-panel-* ~/.local/bin/gh-actions-panel
```

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.3.0 or later

### Setup

```bash
bun install
```

### Run

```bash
bun run dev
```

### Build

Build for current platform:

```bash
bun run build
```

Build for all platforms:

```bash
bun run build:all
```

## Releasing

Releases are triggered by pushing a git tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will automatically build binaries for all platforms and create a GitHub release.
