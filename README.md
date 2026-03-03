[English](README.md) | [中文](README.zh-CN.md)

# star-watch 🌟👀

Monitor your GitHub starred repositories for archival status.

**Problem:** You star hundreds of repos. When one gets archived (like Algolia's hn-search), you often don't know until you need it.

**Solution:** A simple CLI tool that checks your starred repos and alerts you when any get archived.

## Installation

```bash
npm install -g @indiekitai/star-watch
# or
npx @indiekitai/star-watch
```

## Usage

```bash
# Check your starred repos (requires GITHUB_TOKEN)
star-watch check

# Watch for changes and output new archives
star-watch watch --interval 24h

# List all archived repos you've starred
star-watch list-archived
```

## Configuration

Set your GitHub token:
```bash
export GITHUB_TOKEN=your_token_here
```

## Why?

- Algolia's hn-search just got archived (Feb 2026)
- Many useful tools disappear silently
- Forks exist but you need to know about them
- Catch deprecation before it's too late

## Potential Extensions

- Discord/Slack/Telegram notifications
- Suggest active forks
- Track dependency repos too
- RSS feed output
