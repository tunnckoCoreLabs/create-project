import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import proc from 'process';
import signale from 'signale';
import charlike from 'charlike';
import setValue from 'set-value';
import { exec } from '@tunnckocore/execa';
import createGithubRelease from './create-release';
import enableCircleCI from './enable-circleci';
import runQuestions from './questions';

/* eslint-disable no-param-reassign, promise/always-return */

export default async function createProject({ exists = false } = {}) {
  const cwd = proc.cwd();
  const cacheFile = path.join(
    os.homedir(),
    '.cache',
    'tunnckocore-create-project.json',
  );

  const cache = fs.existsSync(cacheFile)
    ? JSON.parse(await util.promisify(fs.readFile)(cacheFile, 'utf8'))
    : {};

  const ctx = {};

  return runQuestions(cache, exists)
    .then((answers) => {
      ctx.answers = answers;
      return answers;
    })
    .then(() => signale.info('Creating initial GitHub Release ...'))
    .then(async () => {
      ctx.answers.path = path.join(cwd, ctx.answers.repo);

      const author = {};
      const { data } = await createGithubRelease(ctx.answers);

      Object.keys(data.author).map((key) =>
        setValue(author, key, data.author[key]),
      );

      ctx.answers.author = Object.assign({}, author, ctx.answers.author);

      const c = ctx.answers.author;

      ctx.answers.gitconfig = {
        name: c.name,
        email: c.email,
        username: c.username,
        github_token: c.github_token,
      };

      ctx.answers.repository = `${ctx.answers.owner}/${ctx.answers.repo}`;
    })
    .then(() => signale.info('Scaffolding project locally ...'))
    .then(() =>
      charlike(ctx.answers.name, ctx.answers.description, {
        locals: ctx.answers,
      }),
    )
    .then(() => signale.info('Enabling CircleCI integration ...'))
    .then(() => enableCircleCI(ctx.answers))
    .then(() => signale.info('Publishing initial v0.0.0 to NPM ...'))
    .then(() => exec('npm publish', { cwd: ctx.answers.path }))
    .then(() => signale.info('Pushing the local git repository to GitHub ...'))
    .then(() =>
      exec(
        [
          'git init',
          'git add --all',
          'git commit -s -S -m "feat: initial release"',
          `git remote add origin git@github.com:${ctx.answers.repository}.git`,
          'git remote -v',
          'git push origin master --force',
        ],
        { cwd: ctx.answers.path },
      ),
    )
    .then(() => signale.info('Almost done! Writing to the local cache ...'))
    .then(() =>
      util.promisify(fs.writeFile)(
        cacheFile,
        JSON.stringify(ctx.answers, 0, 2),
      ),
    )
    .then(() => signale.complete('Your project is ready!'))
    .then(() =>
      signale.complete(
        `See it at https://github.com/${ctx.answers.repository}`,
      ),
    );
}
