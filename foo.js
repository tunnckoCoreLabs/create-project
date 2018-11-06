const prompts = require('prompts');

async function main() {
  await prompts(
    {
      type: 'text',
      message: 'foobar',
    },
    { onSubmit: console.log },
  );
}

main();
