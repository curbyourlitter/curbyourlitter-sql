'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getCanColumnsData = getCanColumnsData;
exports.getCanColumnsDetails = getCanColumnsDetails;
exports.getCanColumnsMap = getCanColumnsMap;
exports.getCanSql = getCanSql;
exports.getCans = getCans;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bbox = require('./bbox');

var _execute = require('./execute');

function getCanColumnsData(config) {
    return ["'can' AS type", 'cartodb_id', 'type AS cantype'];
}

function getCanColumnsDetails(config) {
    return ["'can' AS type", 'cartodb_id', 'type AS cantype', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude'];
}

function getCanColumnsMap(config) {
    return ['*'];
}

function where(filters) {
    var whereConditions = _underscore2['default'].chain(filters).map(function (value, key) {
        return null;
    }).filter(function (value) {
        return value !== null;
    }).value();
    var where = '';
    if (whereConditions.length !== 0) {
        where = ' WHERE ' + whereConditions.join(' OR ');
    }
    return where;
}

function getCanSql(filters, columns, config) {
    if (!columns) {
        columns = getCanColumnsMap(config);
    }
    var sql = 'SELECT ' + columns + ' FROM ' + config.tables.can + ' ';
    if (filters) {
        sql += ' ' + where(filters);
    }
    if (config.mobile) {
        sql += ' LIMIT ' + config.mobileLimit;
    }
    return sql;
}

function getCans(filters, callback, columns, config) {
    var bboxColumns = _underscore2['default'].clone(columns);
    if (filters.bbox) {
        bboxColumns.push((0, _bbox.inBBox)(filters.bbox) + ' AS in_bbox');
        bboxColumns.push((0, _bbox.fromCenterOfBBox)(filters.bbox) + ' AS center_distance');
    }

    (0, _execute.execute)(getCanSql(filters, bboxColumns, config), config.cartodbUser, callback);
}