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
