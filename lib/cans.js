'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getCanColumnsData = getCanColumnsData;
exports.getCanColumnsDetails = getCanColumnsDetails;
exports.getCanColumnsMap = getCanColumnsMap;
exports.getCanSql = getCanSql;
exports.getCans = getCans;

var _bbox = require('./bbox');

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
    var whereConditions = _.chain(filters).map(function (value, key) {
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
    return sql;
}

function getCans(filters, callback, columns, config) {
    var bboxColumns = _.clone(columns);
    if (filters.bbox) {
        bboxColumns.push((0, _bbox.inBBox)(filters.bbox) + ' AS in_bbox');
        bboxColumns.push((0, _bbox.fromCenterOfBBox)(filters.bbox) + ' AS center_distance');
    }

    var cartodbSql = new cartodb.SQL({ user: config.cartodbUser });
    cartodbSql.execute(getCanSql(filters, bboxColumns, config)).done(function (data) {
        callback(data.rows);
    });
}