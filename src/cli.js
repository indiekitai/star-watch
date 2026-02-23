#!/usr/bin/env node

import { getStarredRepos, checkArchived, loadState, saveState, formatResults } from './index.js';

const args = process.argv.slice(2);
const command = args[0] || 'check';

const TOKEN = process.env.GITHUB_TOKEN;
const STATE_FILE = process.env.STAR_WATCH_STATE || `${process.env.HOME}/.star-watch-state.json`;

// Parse args
const getArg = (name, defaultVal) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultVal;
  return args[idx + 1] || defaultVal;
};

const limit = parseInt(getArg('limit', '0'), 10) || undefined;
const json = args.includes('--json');

async function main() {
  if (!TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable required');
    console.error('   Get one at: https://github.com/settings/tokens');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'check': {
        console.log('🔍 Fetching starred repositories...');
        const repos = await getStarredRepos(TOKEN, limit);
        console.log(`   Found ${repos.length} starred repos`);

        const archived = repos.filter(r => r.archived);
        const prevState = await loadState(STATE_FILE);
        const newArchived = archived.filter(r => !prevState.archived?.includes(r.full_name));

        if (json) {
          console.log(JSON.stringify({ total: repos.length, archived, newArchived }, null, 2));
        } else {
          console.log(formatResults(archived, newArchived));
        }

        // Save state
        await saveState(STATE_FILE, {
          lastCheck: new Date().toISOString(),
          total: repos.length,
          archived: archived.map(r => r.full_name)
        });

        if (newArchived.length > 0) {
          process.exit(2); // Exit code 2 = new archives found
        }
        break;
      }

      case 'list-archived': {
        const state = await loadState(STATE_FILE);
        if (!state.archived?.length) {
          console.log('No archived repos in state. Run `star-watch check` first.');
        } else {
          console.log(`📦 ${state.archived.length} archived repos:\n`);
          state.archived.forEach(name => console.log(`  - https://github.com/${name}`));
        }
        break;
      }

      case 'help':
      default:
        console.log(`
star-watch - Monitor GitHub starred repos for archival

Commands:
  check          Check all starred repos for archived status
  list-archived  Show previously detected archived repos

Options:
  --limit N      Only check first N repos
  --json         Output as JSON

Environment:
  GITHUB_TOKEN   Required. GitHub personal access token
  STAR_WATCH_STATE  State file path (default: ~/.star-watch-state.json)

Examples:
  star-watch check
  star-watch check --limit 50
  star-watch check --json
`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('401')) {
      console.error('   Token may be invalid or expired');
    }
    process.exit(1);
  }
}

main();
