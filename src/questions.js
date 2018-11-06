import parse from 'parse-git-config';
import setValue from 'set-value';
import prompts from 'prompts';
import signale from 'signale';
import createGithubRepo from './create-repo';

export default async function runQuestions(cache) {
  const answers = {};
  if (!cache.gitconfig) {
    // eslint-disable-next-line no-param-reassign
    cache.gitconfig = (await parse({ type: 'global' })).user;
  }

  function onSubmit(prompt, answer) {
    if (prompt.name === 'author.username') {
      setValue(answers, 'author.login', answer);
    }
    setValue(answers, prompt.name, answer);
  }
  function onCancel() {
    throw new Error('Exiting...');
  }

  signale.info('Basic questions ...');

  // signale.info({ suffix: 'Step 1', message: 'Basic questions ...' });

  return prompts
    .prompt(
      [
        {
          type: 'select',
          name: 'ownerType',
          message: 'Owner is an organization or an user?',
          choices: [
            { title: 'User', value: 'user' },
            { title: 'Organization', value: 'org' },
          ],
          initial: cache.ownerType === 'org' ? 1 : 0,
        },
        {
          type: 'text',
          name: 'owner',
          message: "What's the project owner?",
          initial: cache.owner,
        },
        {
          type: 'text',
          name: 'repo',
          message: "What's the repository name?",
          initial: cache.repo,
        },
        {
          type: 'text',
          name: 'project.homepage',
          message: "What's your project homepage?",
          initial: () => `https://github.com/${answers.owner}/${answers.repo}`,
        },
        {
          type: 'text',
          name: 'project.description',
          message: "What's your project description?",
          initial: cache.project && cache.project.description,
        },
        {
          type: 'text',
          name: 'author.github_token',
          message: "What's your GitHub token? (only stored locally)",
          initial: cache.author && cache.author.github_token,
        },
        {
          type: 'text',
          name: 'author.circleci_token',
          message: "What's your CircleCI token? (only stored locally)",
          initial: cache.author && cache.author.circleci_token,
        },
      ],
      { onSubmit, onCancel },
    )
    .then(() => signale.info('Creating GitHub repository ...'))
    .then(
      () => createGithubRepo(answers),
      (err) => {
        if (err.statusCode === 422) {
          throw new Error('Repository may already exist. Exiting...');
        }
        throw err;
      },
    )
    .then(() => signale.info('Project and author metadata ...'))
    .then(() =>
      prompts.prompt(
        [
          {
            type: 'text',
            name: 'project.name',
            message: "What's the package name?",
            initial: cache.project && cache.project.name,
          },
          {
            type: 'text',
            name: 'license.name',
            message: "What's the project license?",
            initial: (cache.license && cache.license.name) || 'Apache-2.0',
          },
          {
            type: 'text',
            name: 'license.year',
            message: "What's the license start year?",
            initial: (cache.license && cache.license.year) || '2018',
          },
          {
            type: 'text',
            name: 'author.name',
            message: "What's the author name?",
            initial: cache.gitconfig.name,
          },
          {
            type: 'text',
            name: 'author.email',
            message: "What's the author email?",
            initial: cache.gitconfig.email,
          },
          {
            type: 'text',
            name: 'author.url',
            message: "What's the author website?",
            initial: cache.author && cache.author.url,
          },
          {
            type: 'text',
            name: 'author.username',
            message: "What's the author GitHub username?",
            initial: cache.gitconfig.username,
          },
          {
            type: 'text',
            name: 'author.twitter',
            message: "What's the author Twitter username?",
            initial: cache.author && cache.author.twitter,
          },
        ],
        { onSubmit, onCancel },
      ),
    )
    .then(() => answers);
}
