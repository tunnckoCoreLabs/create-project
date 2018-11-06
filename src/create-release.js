import proc from 'process';
import axios from 'axios';
import parse from 'parse-git-config';

// TODO: externalize
export default async function createGithubRepo(opts, initialVersion = '0.0.0') {
  const options = Object.assign(
    {
      tag_name: `v${initialVersion}`,
      body: 'Initial GitHub Release',
    },
    opts,
    { name: `v${initialVersion}` },
  );

  let githubToken =
    proc.env.GITHUB_TOKEN ||
    options.token ||
    (options.author && options.author.token);

  if (!githubToken) {
    const gitconfig = await parse({ type: 'global' });
    githubToken =
      (gitconfig.user && gitconfig.user.token) ||
      (gitconfig.github && gitconfig.github.token);
  }

  if (!githubToken) {
    throw new Error('Requires GitHub token, but not found.');
  }

  const slug = `${options.owner}/${options.repo}`;

  return axios({
    url: `https://api.github.com/repos/${slug}/releases`,
    method: 'post',
    headers: {
      Authorization: `token ${githubToken}`,
    },
    data: options,
  });
}
