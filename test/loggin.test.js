// const loggin = require('../src/logging-espree');
// const fs = require('fs');
// const appRoot = require('app-root-path');
import * as loggin from '../src/logging-espree';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const appRoot = require('app-root-path');

describe('logging-espree', () => {
    const test1 = fs.readFileSync(appRoot.path + '/test/data/test1.js', 'utf-8');
    const test2 = fs.readFileSync(appRoot.path + '/test/data/test2.js', 'utf-8');
    const test3 = fs.readFileSync(appRoot.path + '/test/data/test3.js', 'utf-8');
    const test4 = fs.readFileSync(appRoot.path + '/test/data/test4.js', 'utf-8');
    const test5 = fs.readFileSync(appRoot.path + '/test/data/test5.js', 'utf-8');

    const test1Expected = fs.readFileSync(appRoot.path + '/test/data/correct-logged1.js', 'utf-8');
    const test2Expected = fs.readFileSync(appRoot.path + '/test/data/correct-logged2.js', 'utf-8');
    const test3Expected = fs.readFileSync(appRoot.path + '/test/data/correct-logged3.js', 'utf-8');
    const test4Expected = fs.readFileSync(appRoot.path + '/test/data/correct-logged4.js', 'utf-8');
    const test5Expected = fs.readFileSync(appRoot.path + '/test/data/correct-logged5.js', 'utf-8');
    console.log('beforeAll');

  it('should add logging to a function declaration', () => {
    expect(loggin.addLogging(test1)).toEqual(test1Expected);
    expect(loggin.addLogging(test2)).toEqual(test2Expected);
    expect(loggin.addLogging(test3)).toEqual(test3Expected);
  });

  it('should add logging to a function expression', () => {
    expect(loggin.addLogging(test4)).toEqual(test4Expected);
  });

  it('should add logging to an arrow function expression', () => {
    expect(loggin.addLogging(test5)).toEqual(test5Expected);
  });

  it('should be able to transpile from a file to another', () => {
    const inputFile = appRoot.path + '/test/data/test1.js';
    const outputFile = appRoot.path + '/test/data/test1-transpiled.js';
    loggin.transpile(inputFile, outputFile);
    expect(fs.readFileSync(outputFile, 'utf-8')).toEqual(test1Expected);

    fs.unlinkSync(outputFile);
  });
});
