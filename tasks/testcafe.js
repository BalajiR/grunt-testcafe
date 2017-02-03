/*
 * grunt-testcafe
 * https://github.com/crudo/grunt-testcafe
 *
 * Copyright (c) crudo <crudo@crudo.cz>
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var createTestCafe = require('testcafe');
var _ = require('lodash');
var testCafeRunner = null;

var DEFAULT_OPTS = {
    browsers: [],
    filter: null,
    screenshotsPath: null,
    takeScreenshotsOnFail: false,
    reporter: 'spec',
    skipJsErrors: false,
    quarantineMode: false,
    selectorTimeout: 10000,
    assertionTimeout: 3000,
    speed: 1,
    startApp: { initDelay: 1000 }
};

module.exports = function(grunt) {
    grunt.registerMultiTask('testcafe', 'testcafe runner', function() {
        var done = this.async();
        var opts = this.options(DEFAULT_OPTS);
        var testcafe = null;

        if (typeof opts.files === 'string') {
            opts.files = [opts.files];
        }

        var files = grunt.file.expand(opts.files).map(function(fileName) {
            return fileName;
        });

        createTestCafe()
            .then(function(tc) {
                testcafe = tc;

                testCafeRunner = testcafe.createRunner();

                if (opts.startApp.command)
                    return testCafeRunner.startApp(opts.startApp.command, opts.startApp.initDelay);

                return null;
            })
            .then(function() {
                if (opts.reporterOutputFile) {
                    var stream = fs.createWriteStream(opts.reporterOutputFile);
                }

                return testCafeRunner
                    .src(files)
                    .browsers(opts.browsers)
                    .filter(opts.filter)
                    .screenshots(opts.screenshotsPath, opts.takeScreenshotsOnFail)
                    .reporter(opts.reporter, stream)
                    .run(opts);
            })
            .then(function(failed) {
                if (failed > 0){
                    throw new Error(err);
                } else {
                    done();
                }
            })
            .catch(function(err) {
                grunt.fail.warn(err.message);
            })
            .then(function() {
                if (testcafe){
                    return testcafe.close();
                }
            })
            .then(done);
    });
};
