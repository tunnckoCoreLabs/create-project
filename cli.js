#!/usr/bin/env node

'use strict';

const proc = require('process');
const createProject = require('./index');

createProject().catch((err) => {
  console.error(err.stack);
  proc.exit(1);
});
