(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var tensor = global.tensor || require("./");
global.tensor = tensor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./":2}],2:[function(require,module,exports){
/**
 * Matrix and tensor operations.
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var n = require("norm.js");

module.exports = {

    multiply: function (a, b) {
        var i, j, k;
        var arows = a.length;
        if (arows) {
            var acols = a[0].length;
            if (acols) {
                var brows = b.length;
                if (brows) {
                    var bcols = b[0].length;
                    if (bcols) {
                        var c = new Array(arows);
                        if (bcols > 1) {
                            for (i = 0; i < arows; ++i) {
                                c[i] = new Array(bcols);
                                for (j = 0; j < bcols; ++j) {
                                    c[i][j] = 0;
                                }
                            }
                        } else {
                            for (i = 0; i < arows; ++i) {
                                c[i] = 0;
                            }
                        }
                        for (i = 0; i < arows; ++i) {
                            for (j = 0; j < bcols; ++j) {
                                for (k = 0; k < acols; ++k) {
                                    if (bcols === 1) {
                                        c[i] += a[i][k] * b[k];
                                    } else {
                                        c[i][j] += a[i][k] * b[k][j];
                                    }
                                }
                            }
                        }
                        return c;
                    }
                }
            }
        }
    },

    outer: function (u, v) {
        var i, j;
        var usz = u.length;
        var p = new Array(usz);
        for (i = 0; i < usz; ++i) {
            p[i] = new Array(usz);
            for (j = 0; j < usz; ++j) {
                p[i][j] = 0;
            }
        }
        for (i = 0; i < usz; ++i) {
            for (j = 0; j < usz; ++j) {
                p[i][j] += u[i] * v[j];
            }
        }
        return p;
    },

    transpose: function (a) {
        var i, j;
        var arows = a.length;
        var acols = a[0].length;
        var at = new Array(acols);
        for (i = 0; i < arows; ++i) {
            at[i] = new Array(arows);
        }
        for (i = 0; i < acols; ++i) {
            for (j = 0; j < arows; ++j) {
                at[i][j] = a[j][i];
            }
        }
        return at;
    },

    // Dot (inner) product of vectors.
    dot: function (u, v) {
        var prod = 0;
        for (var i = 0, usz = u.length; i < usz; ++i) {
            prod += u[i] * v[i];
        }
        return prod;
    },

    any: function (a) { return !!n.sum(a); },

    mask: function (a, target) {
        var asz = a.length;
        var amask = new Array(asz);
        for (var i = 0; i < asz; ++i) {
            if (a[i] === target) {
                amask[i] = 1;
            } else {
                amask[i] = 0;
            }
        }
        return amask;
    },

    diag: function (a) {
        var asz = a.length;
        var d = new Array(asz);
        for (var i = 0; i < asz; ++i) {
            d[i] = new Array(asz);
            for (var j = 0; j < asz; ++j) {
                if (i === j) {
                    d[i][j] = a[i];
                } else {
                    d[i][j] = 0;
                }
            }
        }
        return d;
    },

    kron: function (a, b) {
        var asz = a.length;
        var bsz = b.length;
        var prod = new Array(asz * bsz);
        for (var i = 0; i < asz; ++i) {
            for (var j = 0; j < bsz; ++j) {
                prod[j + bsz*i] = a[i] * b[j];
            }
        }
        return prod;
    },

    hadamard: function (a, arows, acols, b, brows, bcols) {
        var i, j;
        var c = new Array(arows);
        if (bcols > 1) {
            for (i = 0; i < bcols; ++i) {
                c[i] = new Array(bcols);
            }
        }
        for (i = 0; i < arows; ++i) {
            if (bcols === 1 && acols === 1) {
                c[i] = a[i] * b[i];
            } else {
                for (j = 0; j < bcols; ++j) {
                    c[i][j] += a[i][j] * b[i][j];
                }
            }
        }
        return c;
    },

    cov: function (data, rows, cols, unbias) {
        // Covariance matrix.
        //
        // Args:
        //   data: two-dimensional data matrix (signals = columns, samples = rows)
        //   rows: number of rows (samples per signal) in the data matrix
        //   cols: number of columns (signals) in the data matrix
        //
        var tensor = new Array(cols);
        for (var i = 0; i < cols; ++i) {
            tensor[i] = new Array(cols);
            for (var j = 0; j < cols; ++j) {
                var u = 0;
                for (var row = 0; row < rows; ++row) {
                    var i_mean = 0;
                    var j_mean = 0;
                    for (var r = 0; r < rows; ++r) {
                        i_mean += data[r][i];
                        j_mean += data[r][j];
                    }
                    i_mean /= rows;
                    j_mean /= rows;
                    var i_center = data[row][i] - i_mean;
                    var j_center = data[row][j] - j_mean;
                    u += i_center * j_center;
                }
                tensor[i][j] = u / parseFloat(rows - unbias);
            }
        }
        return tensor;
    },

    coskew: function (data, rows, cols, unbias) {
        // Block-unfolded third joint central moment tensor.
        //
        // Args:
        //   data: two-dimensional data matrix (signals = columns, samples = rows)
        //   rows: number of rows (samples per signal) in the data matrix
        //   cols: number of columns (signals) in the data matrix
        //
        var tensor = new Array(cols);
        for (var k = 0; k < cols; ++k) {
            var face = new Array(cols);
            for (var i = 0; i < cols; ++i) {
                face[i] = new Array(cols);
                for (var j = 0; j < cols; ++j) {
                    var u = 0;
                    for (var row = 0; row < rows; ++row) {
                        var i_mean = 0;
                        var j_mean = 0;
                        var k_mean = 0;
                        for (var r = 0; r < rows; ++r) {
                            i_mean += data[r][i];
                            j_mean += data[r][j];
                            k_mean += data[r][k];
                        }
                        i_mean /= rows;
                        j_mean /= rows;
                        k_mean /= rows;
                        var i_center = data[row][i] - i_mean;
                        var j_center = data[row][j] - j_mean;
                        var k_center = data[row][k] - k_mean;
                        u += i_center * j_center * k_center;
                    }
                    face[i][j] = u / parseFloat(rows - unbias);
                }
                tensor[k] = face;
            }
        }
        return tensor;
    },

    cokurt: function (data, rows, cols, unbias) {
        // Block-unfolded fourth joint central moment tensor.
        //
        // Args:
        //   data: two-dimensional data matrix (signals = columns, samples = rows)
        //   rows: number of rows (samples per signal) in the data matrix
        //   cols: number of columns (signals) in the data matrix
        //
        var tensor = new Array(cols);
        for (var l = 0; l < cols; ++l) {
            var block = new Array(cols);
            for (var k = 0; k < cols; ++k) {
                var face = new Array(cols);
                for (var i = 0; i < cols; ++i) {
                    face[i] = new Array(cols);
                    for (var j = 0; j < cols; ++j) {
                        var u = 0;
                        for (var row = 0; row < rows; ++row) {
                            var i_mean = 0;
                            var j_mean = 0;
                            var k_mean = 0;
                            var l_mean = 0;
                            for (var r = 0; r < rows; ++r) {
                                i_mean += data[r][i];
                                j_mean += data[r][j];
                                k_mean += data[r][k];
                                l_mean += data[r][l];
                            }
                            i_mean /= rows;
                            j_mean /= rows;
                            k_mean /= rows;
                            l_mean /= rows;
                            var i_center = data[row][i] - i_mean;
                            var j_center = data[row][j] - j_mean;
                            var k_center = data[row][k] - k_mean;
                            var l_center = data[row][l] - l_mean;
                            u += i_center * j_center * k_center * l_center;
                        }
                        face[i][j] = u / parseFloat(rows - unbias);
                    }
                    block[k] = face;
                }
                tensor[l] = block;
            }
        }
        return tensor;
    }

};

},{"norm.js":3}],3:[function(require,module,exports){
/**
 * Array and object normalization.
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var normjs = {

    sum: function (o) {
        var s = 0;
        if (o.constructor === Array && o.length) {
            for (var i = 0, l = o.length; i < l; ++i) {
                s += o[i];
            }
        } else if (o.constructor === Object) {
            for (var k in o) {
                if (!o.hasOwnProperty(k)) continue;
                s += o[k];
            }
        }
        return s;
    },

    mean: function (o) {
        var l, m = this.sum(o);
        if (o.constructor === Array && o.length) {
            l = o.length;
        } else if (o.constructor === Object) {
            l = 0;
            for (var k in o) {
                if (!o.hasOwnProperty(k)) continue;
                ++l;
            }
        }
        return m / l;
    },

    variance: function (o, bessel) {
        bessel = (bessel) ? 1 : 0;
        var m = this.mean(o);
        var len = 0;
        var v = 0;
        if (o.constructor === Array && o.length) {
            len = o.length;
            for (var i = 0; i < len; ++i) {
                v += Math.pow(o[i] - m, 2);
            }
        } else if (o.constructor === Object) {
            len = 0;
            for (var k in o) {
                if (!o.hasOwnProperty(k)) continue;
                v += Math.pow(o[k] - m, 2);
                ++len;
            }
        }
        if (len < 2) {
            throw new Error("variance not defined for length < 2");
        } else {
            return v / (len - bessel);
        }
    },

    std: function (o, bessel) {
        return Math.sqrt(this.variance(o, bessel));
    },

    norm: function (o, type) {
        var i, k, l, s = 0;
        if (o) {
            if (type) {
                switch (type.toLowerCase()) {
                case "l1":
                    if (o.constructor === Array && o.length) {
                        l = o.length;
                        for (i = 0; i < l; ++i) {
                            s += Math.abs(o[i]);
                        }
                    } else if (o.constructor === Object) {
                        for (k in o) {
                            if (!o.hasOwnProperty(k)) continue;
                            s += Math.abs(o[k]);
                        }
                    }
                    break;
                case "euclidean":
                    if (o.constructor === Array && o.length) {
                        l = o.length;
                        for (i = 0; i < l; ++i) {
                            s += Math.pow(o[i], 2);
                        }
                    } else if (o.constructor === Object) {
                        for (k in o) {
                            if (!o.hasOwnProperty(k)) continue;
                            s += Math.pow(o[k], 2);
                        }
                    }
                    s = Math.sqrt(s);
                    break;
                case "max":
                    if (o.constructor === Array && o.length) {
                        s = Math.max.apply(null, o);
                    } else if (o.constructor === Object) {
                        s = null;
                        for (k in o) {
                            if (!o.hasOwnProperty(k)) continue;
                            if (s === null) {
                                s = o[k];
                            } else {
                                s = Math.max(s, o[k]);
                            }
                        }
                    }
                    break;
                case "min":
                    if (o.constructor === Array && o.length) {
                        s = Math.min.apply(null, o);
                    } else if (o.constructor === Object) {
                        s = null;
                        for (k in o) {
                            if (!o.hasOwnProperty(k)) continue;
                            if (s === null) {
                                s = o[k];
                            } else {
                                s = Math.min(s, o[k]);
                            }
                        }
                    }
                    break;
                default:
                    s = this.sum(o);
                }
            } else {
                s = this.sum(o);
            }
        }
        return s;
    },

    rescale: function (o, factor) {
        if (o && factor) {
            if (o.constructor === Array && o.length) {
                for (var i = 0, l = o.length; i < l; ++i) {
                    o[i] /= factor;
                }
            } else if (o.constructor === Object) {
                for (var k in o) {
                    if (!o.hasOwnProperty(k)) continue;
                    o[k] /= factor;
                }
            }
        }
        return o;
    },

    standardize: function (o, bessel) {
        return this.rescale(o, this.std(o, bessel));
    },

    normalize: function (o, type) {
        return this.rescale(o, this.norm(o, type));
    }

};

module.exports = normjs;

},{}]},{},[1]);
