import proc from 'process';
import axios from 'axios';
import parse from 'parse-git-config';

// TODO: externalize
export default async function createGithubRepo(opts) {
  const options = Object.assign({ auto_init: true, has_wiki: false }, opts);

  let githubToken =
    proc.env.GITHUB_TOKEN ||
    proc.env.GH_TOKEN ||
    opts.github_token ||
    (opts.author && opts.author.github_token) ||
    opts.token;

  if (!githubToken) {
    const gitconfig = await parse({ type: 'global' });
    githubToken =
      (gitconfig.user && gitconfig.user.token) ||
      (gitconfig.github && gitconfig.github.token);
  }

  if (!githubToken) {
    throw new Error('Requires GitHub token, but not found.');
  }

  options.name = options.repo || options.name;
  options.homepage = options.project && options.project.homepage;
  options.description = options.project && options.project.description;

  const endpoint =
    options.ownerType === 'org'
      ? `/orgs/${options.owner}/repos`
      : `/user/repos`;

  return axios({
    url: `https://api.github.com${endpoint}`,
    method: 'post',
    headers: {
      Authorization: `token ${githubToken}`,
    },
    data: options,
  });
}
