(function () {
/**
 * tensor.js unit tests
 */

"use strict";

var assert = require("chai").assert;
var n = require("norm.js");
var chalk = require("chalk");
var tensor = require("../");

var data = [
    [ 0.837698,   0.49452,   2.54352 ],
    [-0.294096,  -0.39636,   0.728619],
    [-1.62089 ,  -0.44919,   1.20592 ],
    [-1.06458 ,  -0.68214,  -1.12841 ],
    [ 2.14341 ,   0.7309 ,   0.644968],
    [-0.284139,  -1.133  ,   1.98615 ],
    [ 1.19879 ,   2.55633,  -0.526461],
    [-0.032277,   0.11701,  -0.249265],
    [-1.02516 ,  -0.44665,   2.50556 ],
    [-0.515272,  -0.578  ,   0.515139],
    [ 0.259474,  -1.24193,   0.105051],
    [ 0.178546,  -0.80547,  -0.016838],
    [-0.607696,  -0.21319,  -1.40657 ],
    [ 0.372248,   0.93341,  -0.667086],
    [-0.099814,   0.52698,  -0.253867],
    [ 0.743166,  -0.79375,   2.11131 ],
    [ 0.109262,  -1.28021,  -0.415184],
    [ 0.499346,  -0.95897,  -2.24336 ],
    [-0.191825,  -0.59756,  -0.63292 ],
    [-1.98255 ,  -1.5936 ,  -0.935766],
    [-0.317612,   1.33143,  -0.46866 ],
    [ 0.666652,  -0.81507,   0.370959],
    [-0.761136,   0.10966,  -0.997161],
    [-1.09972 ,   0.28247,  -0.846566]
];

function str(o) { return JSON.stringify(o); }

function compare(a, b) {
    for (var i = 0; i < a.length; ++i) {
        for (var j = 0; j < a[0].length; ++j) {
            assert.strictEqual(a[i][j], b[i][j]);
        }
    }
}

function print_matrix(m) {
    for (var i = 0, rows = m.length; i < rows; ++i) {
        process.stdout.write("\t");
        for (var j = 0, cols = m[0].length; j < cols; ++j) {
            process.stdout.write(chalk.cyan(m[i][j] + "\t"));
        }
        process.stdout.write("\n");
    }
}

describe("multiply", function () {
    var test = function (t) {
        it(str(t.a) + "," + str(t.b) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.multiply(t.a, t.b));
        });
    };
    test({
        a: [[1, 4], [2, 5], [3, 6]],
        b: [[1, 2, 3], [4, 5, 6]],
        expected: [[17, 22, 27], [22, 29, 36], [27, 36, 45]]
    });
});

describe("outer", function () {
    var test = function (t) {
        it(str(t.a) + "," + str(t.b) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.outer(t.a, t.b));
        });
    };
    test({
        a: [2, 5, 7],
        b: [6, 2, 3],
        expected: [[12, 4, 6], [30, 10, 15], [42, 14, 21]]
    });
});

describe("transpose", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.transpose(t.input));
        });
    };
    test({
        input: [[1, 4], [2, 5], [3, 6]],
        expected: [[1, 2, 3], [4, 5, 6]]
    });
});

describe("any", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + t.expected, function () {
            compare(t.expected, tensor.any(t.input));
        });
    };
    test({
        input: [0, 0, 0, 0, 0],
        expected: 0
    });
    test({
        input: [0, 1, 1, 0, 0],
        expected: 1
    });
    test({
        input: [1, 1, 1, 1],
        expected: 1
    });
});

describe("mask", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + t.expected, function () {
            compare(t.expected, tensor.mask(t.input));
        });
    };
    test({
        input: [5, 1, 1, 0, 2],
        expected: []
    });
});

describe("diag", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + t.expected, function () {
            compare(t.expected, tensor.diag(t.input));
        });
    };
    test({
        input: [1, 3, 6, 8],
        expected: [[1, 0, 0, 0], [0, 3, 0, 0], [0, 0, 6, 0], [0, 0, 0, 8]]
    });
});

describe("kron", function () {
    var test = function (t) {
        it(str(t.a) + "," + str(t.b) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.kron(t.a, t.b));
        });
    };
    test({
        a: [1, 2],
        b: [4, 5, 6],
        expected: [4, 5, 6, 8, 10, 12]
    });
});

describe("hadamard", function () {
    var test = function (t) {
        it(str(t.a) + "," + str(t.b) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.hadamard(t.a, t.b));
        });
    };
    test({
        a: [[1, 4], [2, 5], [3, 6]],
        b: [[1, 2], [3, 4], [5, 6]],
        expected: [4, 5, 6, 8, 10, 12]
    });
});

describe("cov", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.cov(t.input));
        });
    };
    var expected_cov = [];
});

describe("coskew", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.coskew(t.input));
        });
    };
    var expected_coskew = [
        [0.147575,   0.154872,   0.126323,   0.154872,   0.414994,  -0.033756,   0.126323,  -0.033756,   0.013083],
        [0.154872,   0.414994,  -0.033756,   0.414994,   0.861588,  -0.301254,  -0.033756,  -0.301254,  -0.287069],
        [0.126323,  -0.033756,   0.013083,  -0.033756,  -0.301254,  -0.287069,   0.013083,  -0.287069,   1.017824]
    ];
});

describe("cokurt", function () {
    var test = function (t) {
        it(str(t.input) + " -> " + str(t.expected), function () {
            compare(t.expected, tensor.cokurt(t.input));
        });
    };
    var expected_cokurt = [
        [2.126762,   1.118844,   0.474779,   1.118844,   1.122935,   0.187329,   0.474779,   0.187329,   1.155241,   1.118844,   1.122935,   0.187329,   1.122935,   1.404624,  -0.026636,   0.187329,  -0.026636,   0.276558,   0.474779,   0.187329,  1.155241,   0.187329,  -0.026636,   0.276558,   1.155241,   0.276558,   0.178076],
        [1.118844,   1.122935,   0.187329,   1.122935,   1.404624,  -0.026636,   0.187329,  -0.026636,   0.276558,   1.122935,   1.404624,  -0.026636,   1.404624,   3.102880,  -0.517198,  -0.026636,  -0.517198,   0.779222,   0.187329,  -0.026636,  0.276558,  -0.026636,  -0.517198,   0.779222,   0.276558,   0.779222,   0.218735],
        [0.474779,   0.187329,   1.155241,   0.187329,  -0.026636,   0.276558,   1.155241,   0.276558,   0.178076,   0.187329,  -0.026636,   0.276558,  -0.026636,  -0.517198,   0.779222,   0.276558,   0.779222,   0.218735,   1.155241,   0.276558,  0.178076,   0.276558,   0.779222,   0.218735,   0.178076,   0.218735,   5.989492]
    ];
});

})();
