import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Some repositories still launch GitHub's implicit branch/Jekyll publisher.
// Finish our artifact deployment last so that publisher cannot replace the app.
export async function waitForLegacyPages({ listRuns, sleep, attempts = 60 }) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const runs = await listRuns();
    const legacy = runs.filter(run => run.path === 'dynamic/pages/pages-build-deployment');
    if (legacy.every(run => run.status === 'completed')) return;
    console.log('Waiting for the legacy Pages publisher to finish before publishing the React build.');
    await sleep(5000);
  }
  throw new Error('Legacy Pages publication did not finish within five minutes. Retry this workflow after it completes.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const repository = process.env.GITHUB_REPOSITORY;
  const sha = process.env.GITHUB_SHA;
  if (!repository || !sha) throw new Error('GitHub repository and commit are required.');
  await waitForLegacyPages({
    listRuns: async () => {
      const response = await fetch(`${process.env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repository}/actions/runs?head_sha=${sha}&per_page=100`, {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) throw new Error(`Unable to check Pages publications (${response.status}).`);
      return (await response.json()).workflow_runs;
    },
    sleep: ms => new Promise(resolve => setTimeout(resolve, ms)),
  });
}
