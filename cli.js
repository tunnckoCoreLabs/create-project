#!/usr/bin/env node

'use strict';

const proc = require('process');
const mri = require('mri');
const signale = require('signale');
const createProject = require('./index');

const argv = mri(proc.argv.slice(2));

createProject(argv._[0]).catch((err) => {
  if (argv.verbose) {
    signale.fatal(err);
  } else {
    signale.error(err.message);
  }
  proc.exit(1);
});
