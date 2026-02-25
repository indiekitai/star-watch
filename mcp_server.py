#!/usr/bin/env python3
"""
star-watch MCP Server

Monitor GitHub starred repositories for archival status.
"""

import json
import os
import sys
import urllib.request
import urllib.error

try:
    from fastmcp import FastMCP
    mcp = FastMCP("star-watch")
    HAS_MCP = True
except ImportError:
    HAS_MCP = False
    class DummyMCP:
        def tool(self):
            def decorator(f):
                return f
            return decorator
    mcp = DummyMCP()


def github_request(endpoint: str, token: str) -> dict:
    """Make a GitHub API request."""
    req = urllib.request.Request(
        f"https://api.github.com{endpoint}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "star-watch/0.1.0"
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def get_starred_repos(token: str, limit: int = None) -> list:
    """Fetch starred repositories."""
    repos = []
    page = 1
    
    while True:
        data = github_request(f"/user/starred?page={page}&per_page=100", token)
        if not data:
            break
        
        for r in data:
            repos.append({
                "full_name": r["full_name"],
                "html_url": r["html_url"],
                "archived": r["archived"],
                "description": r.get("description"),
                "stars": r["stargazers_count"],
            })
        
        if limit and len(repos) >= limit:
            return repos[:limit]
        
        if len(data) < 100:
            break
        page += 1
    
    return repos


@mcp.tool()
def star_watch_check(limit: int = None) -> str:
    """
    Check your GitHub starred repositories for archived ones.
    
    Requires GITHUB_TOKEN environment variable.
    
    Args:
        limit: Maximum repos to check (default: all)
    
    Returns:
        JSON with total starred, archived list, stats
    """
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        return json.dumps({"error": "GITHUB_TOKEN environment variable required"})
    
    try:
        repos = get_starred_repos(token, limit)
        archived = [r for r in repos if r["archived"]]
        
        return json.dumps({
            "total_starred": len(repos),
            "archived_count": len(archived),
            "archived": archived,
            "health_percent": round((1 - len(archived) / len(repos)) * 100, 1) if repos else 100,
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def star_watch_repo(repo: str) -> str:
    """
    Check if a specific repository is archived.
    
    Args:
        repo: Repository full name (e.g., "owner/repo")
    
    Returns:
        JSON with repo status
    """
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        return json.dumps({"error": "GITHUB_TOKEN environment variable required"})
    
    try:
        data = github_request(f"/repos/{repo}", token)
        return json.dumps({
            "full_name": data["full_name"],
            "archived": data["archived"],
            "description": data.get("description"),
            "stars": data["stargazers_count"],
            "forks": data["forks_count"],
            "updated_at": data["updated_at"],
        }, indent=2)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return json.dumps({"error": f"Repository {repo} not found (may be deleted)"})
        return json.dumps({"error": str(e)})
    except Exception as e:
        return json.dumps({"error": str(e)})


def main():
    if not HAS_MCP:
        print("Error: fastmcp not installed.", file=sys.stderr)
        print("Install with: pip install fastmcp", file=sys.stderr)
        sys.exit(1)
    mcp.run()


if __name__ == "__main__":
    main()
