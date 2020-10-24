(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.hextile = f()
    }
})(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }
        return r
    })()({
        1: [function(require, module, exports) {
            var hextile = require("hextile");

            module.exports = hextile;
        }, {
            "hextile": 3
        }],
        2: [function(require, module, exports) {
            'use strict';

            Object.defineProperty(exports, "__esModule", {
                value: true
            });

            var _slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;
                    try {
                        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                            _arr.push(_s.value);
                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i["return"]) _i["return"]();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) {
                        return arr;
                    } else if (Symbol.iterator in Object(arr)) {
                        return sliceIterator(arr, i);
                    } else {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    }
                };
            }();

            exports.equirectangular = equirectangular;
            exports.polar2cartesian = polar2cartesian;
            exports.dotProduct = dotProduct;
            exports.linearSolver = linearSolver;
            exports.isInside = isInside;
            exports.bbox2geojson = bbox2geojson;

            function equirectangular(center, width) {
                var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6371000;

                var rad2deg = 180 / Math.PI;
                var dy = width / radius * rad2deg;
                var dx = width / (Math.cos(center[1] / rad2deg) * radius) * rad2deg;
                return {
                    forward: function forward(_ref) {
                        var _ref2 = _slicedToArray(_ref, 2),
                            lng = _ref2[0],
                            lat = _ref2[1];

                        return [(lng - center[0]) / dx, (lat - center[1]) / dy];
                    },
                    inverse: function inverse(_ref3) {
                        var _ref4 = _slicedToArray(_ref3, 2),
                            x = _ref4[0],
                            y = _ref4[1];

                        return [center[0] + x * dx, center[1] + y * dy];
                    }
                };
            }

            function polar2cartesian(theta) {
                return [Math.sin(theta / 180 * Math.PI), -Math.cos(theta / 180 * Math.PI)];
            }

            function dotProduct(v1, v2) {
                return v1.reduce(function(sum, e, i) {
                    return sum + e * v2[i];
                }, 0);
            }

            function linearSolver(_ref5, _ref6) {
                var _ref8 = _slicedToArray(_ref5, 2),
                    alpha1 = _ref8[0],
                    beta1 = _ref8[1];

                var _ref7 = _slicedToArray(_ref6, 2),
                    alpha2 = _ref7[0],
                    beta2 = _ref7[1];

                var DET = alpha1 * beta2 - alpha2 * beta1;
                return function(d1, d2) {
                    return [(beta2 * d1 - beta1 * d2) / DET, (-alpha2 * d1 + alpha1 * d2) / DET];
                };
            }

            function isInside(_ref9, linearRing) {
                var _ref10 = _slicedToArray(_ref9, 2),
                    lng = _ref10[0],
                    lat = _ref10[1];

                var isInside = false;
                for (var i = 1; i < linearRing.length; i++) {
                    var deltaYplus = linearRing[i][1] - lat;
                    var deltaYminus = lat - linearRing[i - 1][1];
                    if (deltaYplus > 0 && deltaYminus <= 0) continue;
                    if (deltaYplus < 0 && deltaYminus >= 0) continue;
                    var deltaX = (deltaYplus * linearRing[i - 1][0] + deltaYminus * linearRing[i][0]) / (deltaYplus + deltaYminus) - lng;
                    if (deltaX <= 0) continue;
                    isInside = !isInside;
                }
                return isInside;
            }

            function bbox2geojson(bbox) {
                return {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [bbox[0], bbox[1]],
                            [bbox[2], bbox[1]],
                            [bbox[2], bbox[3]],
                            [bbox[0], bbox[3]],
                            [bbox[0], bbox[1]]
                        ]
                    ]
                };
            }
        }, {}],
        3: [function(require, module, exports) {
            'use strict';

            var _slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [];
                    var _n = true;
                    var _d = false;
                    var _e = undefined;
                    try {
                        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                            _arr.push(_s.value);
                            if (i && _arr.length === i) break;
                        }
                    } catch (err) {
                        _d = true;
                        _e = err;
                    } finally {
                        try {
                            if (!_n && _i["return"]) _i["return"]();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) {
                        return arr;
                    } else if (Symbol.iterator in Object(arr)) {
                        return sliceIterator(arr, i);
                    } else {
                        throw new TypeError("Invalid attempt to destructure non-iterable instance");
                    }
                };
            }();

            var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
                return typeof obj;
            } : function(obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };

            var _min = require('lodash/min');

            var _min2 = _interopRequireDefault(_min);

            var _max = require('lodash/max');

            var _max2 = _interopRequireDefault(_max);

            var _helpers = require('./helpers');

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    default: obj
                };
            }

            function _toArray(arr) {
                return Array.isArray(arr) ? arr : Array.from(arr);
            }

            function _defineProperty(obj, key, value) {
                if (key in obj) {
                    Object.defineProperty(obj, key, {
                        value: value,
                        enumerable: true,
                        configurable: true,
                        writable: true
                    });
                } else {
                    obj[key] = value;
                }
                return obj;
            }

            function _toConsumableArray(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                        arr2[i] = arr[i];
                    }
                    return arr2;
                } else {
                    return Array.from(arr);
                }
            }

            /**
             * @param {(Object|Object[]|[number, number, number, number])} geojson|bbox - https://tools.ietf.org/html/rfc7946
             * @param {('square'|'hexagon')} options.shape - default 'square'
             * @param {number} options.width - in metre, default 1000, min 500, max 500000
             * @param {number} options.tilt - in deg, default 0
             * @param {[number, number]} options.center - [lon, lat] of grid origin
             * @param {Object} options.projection
             * @param {Function} options.projection.forward - map lonlat to grid coordinates
             * @param {Function} options.projection.inverse - map grid coordinates to lonlat
             */
            module.exports = function(geojson) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                if (geojson instanceof Array && geojson.length === 4 && geojson.every(function(v) {
                        return typeof v === 'number';
                    })) {
                    geojson = (0, _helpers.bbox2geojson)(geojson);
                }

                // normalize geojson input
                var input = [];

                function extractPolygons(node) {
                    if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) !== 'object') return;
                    if (node instanceof Array) {
                        node.forEach(extractPolygons);
                    } else if (node.type === 'Polygon') {
                        input.push(node.coordinates);
                    } else if (node.type === 'MultiPolygon') {
                        var _input;

                        (_input = input).push.apply(_input, _toConsumableArray(node.coordinates));
                    } else if (node.type === 'Feature') {
                        extractPolygons(node.geometry);
                    } else if (node.type === 'GeometryCollection') {
                        node.geometries.forEach(extractPolygons);
                    } else if (node.type === 'FeatureCollection') {
                        node.features.forEach(extractPolygons);
                    }
                }
                extractPolygons(geojson);

                input = input.map(function(coordinates) {
                    return {
                        coordinates: coordinates,
                        bbox: [(0, _min2.default)(coordinates[0].map(function(point) {
                            return point[0];
                        })), (0, _min2.default)(coordinates[0].map(function(point) {
                            return point[1];
                        })), (0, _max2.default)(coordinates[0].map(function(point) {
                            return point[0];
                        })), (0, _max2.default)(coordinates[0].map(function(point) {
                            return point[1];
                        }))]
                    };
                });

                // global bbox
                var bbox = [(0, _min2.default)(input.map(function(polygon) {
                    return polygon.bbox[0];
                })), (0, _min2.default)(input.map(function(polygon) {
                    return polygon.bbox[1];
                })), (0, _max2.default)(input.map(function(polygon) {
                    return polygon.bbox[2];
                })), (0, _max2.default)(input.map(function(polygon) {
                    return polygon.bbox[3];
                }))];

                // set default options
                options.shape = options.shape || 'square';
                options.tilt = options.tilt || 0;
                options.width = options.width || 1000;
                options.width = Math.max(options.width, 500);
                options.width = Math.min(options.width, 500000);
                options.center = options.center || [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
                options.projection = options.projection || (0, _helpers.equirectangular)(options.center, options.width);

                var forward = options.projection.forward;
                var inverse = options.projection.inverse;
                // different grid spacing for hexagon
                var step = options.shape === 'hexagon' ? Math.sqrt(3) / 4 : 1;
                var grid = {};
                var output = [];

                /*
                  given grid orientation (beta) and a set of potential endpoints,
                  find min and max grid number (not inclusive of extreme values)
                */
                function dRange(beta, endpoints) {
                    var dValues = endpoints.map(function(ep) {
                        return (0, _helpers.dotProduct)(beta, ep);
                    });
                    return {
                        min: Math.floor((0, _min2.default)(dValues) / step + 1),
                        max: Math.ceil((0, _max2.default)(dValues) / step - 1)
                    };
                }

                var corners = [forward([bbox[0], bbox[1]]), forward([bbox[2], bbox[3]]), forward([bbox[0], bbox[3]]), forward([bbox[2], bbox[1]])];

                if (options.shape === 'square') {
                    (function() {
                        var beta0 = (0, _helpers.polar2cartesian)(options.tilt);
                        var beta1 = (0, _helpers.polar2cartesian)(options.tilt + 90);
                        var dRange0 = dRange(beta0, corners);
                        var dRange1 = dRange(beta1, corners);

                        // enumerate through all potential grid cell
                        for (var i = dRange0.min - 1; i <= dRange0.max + 1; i++) {
                            grid[i] = {};
                            for (var j = dRange1.min - 1; j <= dRange1.max + 1; j++) {
                                grid[i][j] = {};
                            }
                        }

                        input.forEach(function(polygon) {
                            polygon.coordinates.forEach(function(linearRing) {
                                linearRing = linearRing.map(forward);
                                for (var n = 0; n < linearRing.length - 1; n++) {
                                    /*
                                      If a line segment of the input polygon cuts a grid line,
                                      label the cell directly above and below the point
                                      where the line segment cuts the grid line 'keep'.
                                      This traces out the grid cells lying on the edge of the input polygon
                                    */
                                    var beta = [linearRing[n + 1][1] - linearRing[n][1], linearRing[n][0] - linearRing[n + 1][0]];
                                    var d = linearRing[n][0] * linearRing[n + 1][1] - linearRing[n][1] * linearRing[n + 1][0];

                                    var iRange = dRange(beta0, [linearRing[n], linearRing[n + 1]]);
                                    var iIntersection = (0, _helpers.linearSolver)(beta0, beta);
                                    for (var _i2 = iRange.min; _i2 <= iRange.max; _i2++) {
                                        var intersection = iIntersection(_i2, d);
                                        var _j2 = Math.floor((0, _helpers.dotProduct)(beta1, intersection));
                                        grid[_i2][_j2].keep = true;
                                        grid[_i2 - 1][_j2].keep = true;
                                    }

                                    var jRange = dRange(beta1, [linearRing[n], linearRing[n + 1]]);
                                    var jIntersection = (0, _helpers.linearSolver)(beta1, beta);
                                    for (var _j3 = jRange.min; _j3 <= jRange.max; _j3++) {
                                        var _intersection = jIntersection(_j3, d);
                                        var _i3 = Math.floor((0, _helpers.dotProduct)(beta0, _intersection));
                                        grid[_i3][_j3].keep = true;
                                        grid[_i3][_j3 - 1].keep = true;
                                    }
                                }
                            });
                        });

                        // translate grid cells into output polygons
                        var getIntersection = (0, _helpers.linearSolver)(beta0, beta1);

                        for (var _i in grid) {
                            var _i4 = +_i;
                            for (var _j in grid[_i4]) {
                                var _j4 = +_j;
                                output.push({
                                    id: [_i4, _j4].join('.').replace(/-/g, 'M'),
                                    type: 'Feature',
                                    properties: {
                                        address: [_i4, _j4],
                                        center: inverse(getIntersection(_i4 + 0.5, _j4 + 0.5))
                                    },
                                    geometry: {
                                        type: 'Polygon',
                                        coordinates: [
                                            [inverse(getIntersection(_i4, _j4)), inverse(getIntersection(_i4 + 1, _j4)), inverse(getIntersection(_i4 + 1, _j4 + 1)), inverse(getIntersection(_i4, _j4 + 1))]
                                        ]
                                    },
                                    keep: grid[_i4][_j4].keep
                                });
                            }
                        }
                    })();
                } else if (options.shape === 'hexagon') {
                    (function() {
                        var beta0 = (0, _helpers.polar2cartesian)(options.tilt);
                        var beta1 = (0, _helpers.polar2cartesian)(options.tilt + 60);
                        var beta2 = (0, _helpers.polar2cartesian)(options.tilt + 120);
                        var dRange0 = dRange(beta0, corners);
                        var dRange1 = dRange(beta1, corners);

                        for (var i = dRange0.min - 2; i <= dRange0.max + 2; i++) {
                            grid[i] = {};
                            for (var j = dRange1.min - 2; j <= dRange1.max + 2; j++) {
                                var _grid$i$j;

                                grid[i][j] = (_grid$i$j = {}, _defineProperty(_grid$i$j, j - i + 1, {}), _defineProperty(_grid$i$j, j - i - 1, {}), _grid$i$j);
                            }
                        }

                        input.forEach(function(polygon) {
                            polygon.coordinates.forEach(function(linearRing) {
                                linearRing = linearRing.map(forward);
                                for (var n = 0; n < linearRing.length - 1; n++) {
                                    // similar logic as above
                                    var beta = [linearRing[n + 1][1] - linearRing[n][1], linearRing[n][0] - linearRing[n + 1][0]];
                                    var d = linearRing[n][0] * linearRing[n + 1][1] - linearRing[n][1] * linearRing[n + 1][0];

                                    var iRange = dRange(beta0, [linearRing[n], linearRing[n + 1]]);
                                    var iIntersection = (0, _helpers.linearSolver)(beta0, beta);
                                    for (var _i5 = iRange.min; _i5 <= iRange.max; _i5++) {
                                        var intersection = iIntersection(_i5 * step, d);
                                        var _j5 = Math.floor((0, _helpers.dotProduct)(beta1, intersection) / step);
                                        var k = Math.floor((0, _helpers.dotProduct)(beta2, intersection) / step);
                                        if (_i5 - _j5 + k === 1 || _i5 - _j5 + k === -1) {
                                            grid[_i5][_j5][k].keep = true;
                                            grid[_i5][_j5 + 1][k + 1].keep = true;
                                        } else {
                                            grid[_i5][_j5 + 1][k].keep = true;
                                            grid[_i5][_j5][k + 1].keep = true;
                                        }
                                    }

                                    var jRange = dRange(beta1, [linearRing[n], linearRing[n + 1]]);
                                    var jIntersection = (0, _helpers.linearSolver)(beta1, beta);
                                    for (var _j6 = jRange.min; _j6 <= jRange.max; _j6++) {
                                        var _intersection2 = jIntersection(_j6 * step, d);
                                        var _i6 = Math.floor((0, _helpers.dotProduct)(beta0, _intersection2) / step);
                                        var _k = Math.floor((0, _helpers.dotProduct)(beta2, _intersection2) / step);
                                        if (_i6 - _j6 + _k === 1 || _i6 - _j6 + _k === -1) {
                                            grid[_i6][_j6][_k].keep = true;
                                            grid[_i6 + 1][_j6][_k + 1].keep = true;
                                        } else {
                                            grid[_i6 + 1][_j6][_k].keep = true;
                                            grid[_i6][_j6][_k + 1].keep = true;
                                        }
                                    }

                                    var kRange = dRange(beta2, [linearRing[n], linearRing[n + 1]]);
                                    var kIntersection = (0, _helpers.linearSolver)(beta2, beta);
                                    for (var _k2 = kRange.min; _k2 <= kRange.max; _k2++) {
                                        var _intersection3 = kIntersection(_k2 * step, d);
                                        var _i7 = Math.floor((0, _helpers.dotProduct)(beta0, _intersection3) / step);
                                        var _j7 = Math.floor((0, _helpers.dotProduct)(beta1, _intersection3) / step);
                                        if (_i7 - _j7 + _k2 === 1 || _i7 - _j7 + _k2 === -1) {
                                            grid[_i7][_j7][_k2].keep = true;
                                            grid[_i7 + 1][_j7 + 1][_k2].keep = true;
                                        } else {
                                            grid[_i7 + 1][_j7][_k2].keep = true;
                                            grid[_i7][_j7 + 1][_k2].keep = true;
                                        }
                                    }
                                }
                            });
                        });

                        var getIntersection = (0, _helpers.linearSolver)(beta0, beta1);

                        for (var _i in grid) {
                            var _i8 = +_i;
                            if (!grid[_i8 - 1] || !grid[_i8 + 1]) continue;
                            for (var _j in grid[_i8]) {
                                var _j8 = +_j;
                                if (!grid[_i8][_j8 - 1] || !grid[_i8][_j8 + 1]) continue;
                                if ((_i8 + _j8) % 3 === 0) {
                                    // combines six triangular grid cells into one hexagon grid cell
                                    var k = _j8 - _i8;
                                    output.push({
                                        id: [_i8, _j8].join('.').replace(/-/g, 'M'),
                                        type: 'Feature',
                                        properties: {
                                            address: [_i8, _j8],
                                            center: inverse(getIntersection(_i8 * step, _j8 * step))
                                        },
                                        geometry: {
                                            type: 'Polygon',
                                            coordinates: [
                                                [inverse(getIntersection(_i8 * step, (_j8 + 1) * step)), inverse(getIntersection((_i8 - 1) * step, _j8 * step)), inverse(getIntersection((_i8 - 1) * step, (_j8 - 1) * step)), inverse(getIntersection(_i8 * step, (_j8 - 1) * step)), inverse(getIntersection((_i8 + 1) * step, _j8 * step)), inverse(getIntersection((_i8 + 1) * step, (_j8 + 1) * step))]
                                            ]
                                        },
                                        keep: [
                                            [_i8, _j8, k + 1],
                                            [_i8 - 1, _j8, k],
                                            [_i8, _j8 - 1, k],
                                            [_i8, _j8, k - 1],
                                            [_i8 + 1, _j8, k],
                                            [_i8, _j8 + 1, k]
                                        ].some(function(_ref) {
                                            var _ref2 = _slicedToArray(_ref, 3),
                                                i = _ref2[0],
                                                j = _ref2[1],
                                                k = _ref2[2];

                                            return grid[i][j][k].keep;
                                        })
                                    });
                                }
                            }
                        }
                    })();
                }

                output = output.filter(function(feature) {
                    if (feature.keep) return true;
                    /*
                      if center of grid cell lies inside one of the input polygons,
                      include that grid cell in final output
                    */
                    var center = feature.properties.center;
                    return input.some(function(polygon) {
                        if (center[0] < polygon.bbox[0]) return false;
                        if (center[1] < polygon.bbox[1]) return false;
                        if (center[0] > polygon.bbox[2]) return false;
                        if (center[1] > polygon.bbox[3]) return false;

                        var _polygon$coordinates = _toArray(polygon.coordinates),
                            outerRing = _polygon$coordinates[0],
                            innerRings = _polygon$coordinates.slice(1);

                        return (0, _helpers.isInside)(center, outerRing) && innerRings.every(function(innerRing) {
                            return !(0, _helpers.isInside)(center, innerRing);
                        });
                    });
                });

                output.forEach(function(feature) {
                    delete feature.keep;
                    // copy first point to complete linearRing
                    var linearRing = feature.geometry.coordinates[0];
                    linearRing.push(linearRing[0]);
                });

                return output;
            };
        }, {
            "./helpers": 2,
            "lodash/max": 16,
            "lodash/min": 17
        }],
        4: [function(require, module, exports) {
            var root = require('./_root');

            /** Built-in value references. */
            var Symbol = root.Symbol;

            module.exports = Symbol;

        }, {
            "./_root": 12
        }],
        5: [function(require, module, exports) {
            var isSymbol = require('./isSymbol');

            /**
             * The base implementation of methods like `_.max` and `_.min` which accepts a
             * `comparator` to determine the extremum value.
             *
             * @private
             * @param {Array} array The array to iterate over.
             * @param {Function} iteratee The iteratee invoked per iteration.
             * @param {Function} comparator The comparator used to compare values.
             * @returns {*} Returns the extremum value.
             */
            function baseExtremum(array, iteratee, comparator) {
                var index = -1,
                    length = array.length;

                while (++index < length) {
                    var value = array[index],
                        current = iteratee(value);

                    if (current != null && (computed === undefined ?
                            (current === current && !isSymbol(current)) :
                            comparator(current, computed)
                        )) {
                        var computed = current,
                            result = value;
                    }
                }
                return result;
            }

            module.exports = baseExtremum;

        }, {
            "./isSymbol": 15
        }],
        6: [function(require, module, exports) {
            var Symbol = require('./_Symbol'),
                getRawTag = require('./_getRawTag'),
                objectToString = require('./_objectToString');

            /** `Object#toString` result references. */
            var nullTag = '[object Null]',
                undefinedTag = '[object Undefined]';

            /** Built-in value references. */
            var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

            /**
             * The base implementation of `getTag` without fallbacks for buggy environments.
             *
             * @private
             * @param {*} value The value to query.
             * @returns {string} Returns the `toStringTag`.
             */
            function baseGetTag(value) {
                if (value == null) {
                    return value === undefined ? undefinedTag : nullTag;
                }
                return (symToStringTag && symToStringTag in Object(value)) ?
                    getRawTag(value) :
                    objectToString(value);
            }

            module.exports = baseGetTag;

        }, {
            "./_Symbol": 4,
            "./_getRawTag": 10,
            "./_objectToString": 11
        }],
        7: [function(require, module, exports) {
            /**
             * The base implementation of `_.gt` which doesn't coerce arguments.
             *
             * @private
             * @param {*} value The value to compare.
             * @param {*} other The other value to compare.
             * @returns {boolean} Returns `true` if `value` is greater than `other`,
             *  else `false`.
             */
            function baseGt(value, other) {
                return value > other;
            }

            module.exports = baseGt;

        }, {}],
        8: [function(require, module, exports) {
            /**
             * The base implementation of `_.lt` which doesn't coerce arguments.
             *
             * @private
             * @param {*} value The value to compare.
             * @param {*} other The other value to compare.
             * @returns {boolean} Returns `true` if `value` is less than `other`,
             *  else `false`.
             */
            function baseLt(value, other) {
                return value < other;
            }

            module.exports = baseLt;

        }, {}],
        9: [function(require, module, exports) {
            (function(global) {
                /** Detect free variable `global` from Node.js. */
                var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

                module.exports = freeGlobal;

            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}],
        10: [function(require, module, exports) {
            var Symbol = require('./_Symbol');

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /** Used to check objects for own properties. */
            var hasOwnProperty = objectProto.hasOwnProperty;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var nativeObjectToString = objectProto.toString;

            /** Built-in value references. */
            var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

            /**
             * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
             *
             * @private
             * @param {*} value The value to query.
             * @returns {string} Returns the raw `toStringTag`.
             */
            function getRawTag(value) {
                var isOwn = hasOwnProperty.call(value, symToStringTag),
                    tag = value[symToStringTag];

                try {
                    value[symToStringTag] = undefined;
                    var unmasked = true;
                } catch (e) {}

                var result = nativeObjectToString.call(value);
                if (unmasked) {
                    if (isOwn) {
                        value[symToStringTag] = tag;
                    } else {
                        delete value[symToStringTag];
                    }
                }
                return result;
            }

            module.exports = getRawTag;

        }, {
            "./_Symbol": 4
        }],
        11: [function(require, module, exports) {
            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var nativeObjectToString = objectProto.toString;

            /**
             * Converts `value` to a string using `Object.prototype.toString`.
             *
             * @private
             * @param {*} value The value to convert.
             * @returns {string} Returns the converted string.
             */
            function objectToString(value) {
                return nativeObjectToString.call(value);
            }

            module.exports = objectToString;

        }, {}],
        12: [function(require, module, exports) {
            var freeGlobal = require('./_freeGlobal');

            /** Detect free variable `self`. */
            var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

            /** Used as a reference to the global object. */
            var root = freeGlobal || freeSelf || Function('return this')();

            module.exports = root;

        }, {
            "./_freeGlobal": 9
        }],
        13: [function(require, module, exports) {
            /**
             * This method returns the first argument it receives.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Util
             * @param {*} value Any value.
             * @returns {*} Returns `value`.
             * @example
             *
             * var object = { 'a': 1 };
             *
             * console.log(_.identity(object) === object);
             * // => true
             */
            function identity(value) {
                return value;
            }

            module.exports = identity;

        }, {}],
        14: [function(require, module, exports) {
            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return value != null && typeof value == 'object';
            }

            module.exports = isObjectLike;

        }, {}],
        15: [function(require, module, exports) {
            var baseGetTag = require('./_baseGetTag'),
                isObjectLike = require('./isObjectLike');

            /** `Object#toString` result references. */
            var symbolTag = '[object Symbol]';

            /**
             * Checks if `value` is classified as a `Symbol` primitive or object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
             * @example
             *
             * _.isSymbol(Symbol.iterator);
             * // => true
             *
             * _.isSymbol('abc');
             * // => false
             */
            function isSymbol(value) {
                return typeof value == 'symbol' ||
                    (isObjectLike(value) && baseGetTag(value) == symbolTag);
            }

            module.exports = isSymbol;

        }, {
            "./_baseGetTag": 6,
            "./isObjectLike": 14
        }],
        16: [function(require, module, exports) {
            var baseExtremum = require('./_baseExtremum'),
                baseGt = require('./_baseGt'),
                identity = require('./identity');

            /**
             * Computes the maximum value of `array`. If `array` is empty or falsey,
             * `undefined` is returned.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Math
             * @param {Array} array The array to iterate over.
             * @returns {*} Returns the maximum value.
             * @example
             *
             * _.max([4, 2, 8, 6]);
             * // => 8
             *
             * _.max([]);
             * // => undefined
             */
            function max(array) {
                return (array && array.length) ?
                    baseExtremum(array, identity, baseGt) :
                    undefined;
            }

            module.exports = max;

        }, {
            "./_baseExtremum": 5,
            "./_baseGt": 7,
            "./identity": 13
        }],
        17: [function(require, module, exports) {
            var baseExtremum = require('./_baseExtremum'),
                baseLt = require('./_baseLt'),
                identity = require('./identity');

            /**
             * Computes the minimum value of `array`. If `array` is empty or falsey,
             * `undefined` is returned.
             *
             * @static
             * @since 0.1.0
             * @memberOf _
             * @category Math
             * @param {Array} array The array to iterate over.
             * @returns {*} Returns the minimum value.
             * @example
             *
             * _.min([4, 2, 8, 6]);
             * // => 2
             *
             * _.min([]);
             * // => undefined
             */
            function min(array) {
                return (array && array.length) ?
                    baseExtremum(array, identity, baseLt) :
                    undefined;
            }

            module.exports = min;

        }, {
            "./_baseExtremum": 5,
            "./_baseLt": 8,
            "./identity": 13
        }]
    }, {}, [1])(1)
});