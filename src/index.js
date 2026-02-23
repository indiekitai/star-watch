import { readFile, writeFile } from 'fs/promises';

/**
 * Fetch all starred repos for the authenticated user
 */
export async function getStarredRepos(token, limit) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(`https://api.github.com/user/starred?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'star-watch/0.1.0'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.length === 0) break;

    repos.push(...data.map(r => ({
      full_name: r.full_name,
      html_url: r.html_url,
      archived: r.archived,
      description: r.description,
      stars: r.stargazers_count,
      updated_at: r.updated_at
    })));

    if (limit && repos.length >= limit) {
      return repos.slice(0, limit);
    }

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

/**
 * Load state from file
 */
export async function loadState(path) {
  try {
    const data = await readFile(path, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save state to file
 */
export async function saveState(path, state) {
  await writeFile(path, JSON.stringify(state, null, 2));
}

/**
 * Format results for CLI output
 */
export function formatResults(archived, newArchived) {
  const lines = [];

  if (archived.length === 0) {
    lines.push('✅ No archived repositories found in your stars!');
    return lines.join('\n');
  }

  if (newArchived.length > 0) {
    lines.push(`🆕 ${newArchived.length} newly archived since last check:\n`);
    newArchived.forEach(r => {
      lines.push(`  ⚠️  ${r.full_name}`);
      lines.push(`      ${r.html_url}`);
      if (r.description) lines.push(`      "${r.description}"`);
      lines.push('');
    });
    lines.push('');
  }

  lines.push(`📦 Total archived repos: ${archived.length}\n`);
  archived.filter(r => !newArchived.find(n => n.full_name === r.full_name)).forEach(r => {
    lines.push(`  - ${r.full_name}`);
  });

  lines.push('\n💡 Tip: Check for active forks at https://github.com/OWNER/REPO/forks');

  return lines.join('\n');
}

/**
 * Check a single repo's archive status
 */
export async function checkArchived(token, fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'star-watch/0.1.0'
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      return { full_name: fullName, deleted: true };
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    full_name: data.full_name,
    archived: data.archived,
    deleted: false
  };
}
