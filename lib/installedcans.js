'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getInstalledCanColumnsData = getInstalledCanColumnsData;
exports.getInstalledCanColumnsDetails = getInstalledCanColumnsDetails;
exports.getInstalledCanColumnsMap = getInstalledCanColumnsMap;
exports.getInstalledCanSql = getInstalledCanSql;
exports.getInstalledCans = getInstalledCans;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bbox = require('./bbox');

var _execute = require('./execute');

function getInstalledCanColumnsData(config) {
    return ["'installedcan' AS type", 'type AS cantype', 'cartodb_id', 'name'];
}

function getInstalledCanColumnsDetails(config) {
    return ["'installedcan' AS type", 'type AS cantype', 'cartodb_id', 'name', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude'];
}

function getInstalledCanColumnsMap(config) {
    return ['*', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude'];
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

function getInstalledCanSql(filters, columns, config) {
    if (!columns) {
        columns = getInstalledCanColumnsMap(config);
    }
    var sql = 'SELECT ' + columns + ' FROM ' + config.tables.installedcan + ' ';
    if (filters) {
        sql += ' ' + where(filters);
    }
    if (config.mobile) {
        sql += ' LIMIT ' + config.mobileLimit;
    }
    return sql;
}

function getInstalledCans(filters, callback, columns, config) {
    var bboxColumns = _underscore2['default'].clone(columns);
    if (filters.bbox) {
        bboxColumns.push((0, _bbox.inBBox)(filters.bbox) + ' AS in_bbox');
        bboxColumns.push((0, _bbox.fromCenterOfBBox)(filters.bbox) + ' AS center_distance');
    }

    (0, _execute.execute)(getInstalledCanSql(filters, bboxColumns, config), config.cartodbUser, callback);
}