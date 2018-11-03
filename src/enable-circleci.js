// https://circleci.com/api/v1.1/project/
// github/tunnckoCoreLabs/foobar/build?circle-token=XXXX
import proc from 'process';
import axios from 'axios';

export default async function enableCircleCI(answers, type = 'follow') {
  const api = 'https://circleci.com/api/v1.1/project';
  const token =
    proc.env.CIRCLECI_TOKEN ||
    answers.circleci_token ||
    (answers.author && answers.author.circleci_token) ||
    answers.token;

  return axios.post(
    `${api}/github/${answers.repository}/${type}?circle-token=${token}`,
  );
}
