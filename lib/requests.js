'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getRequestColumnsData = getRequestColumnsData;
exports.getRequestColumnsDetails = getRequestColumnsDetails;
exports.getRequestColumnsDownload = getRequestColumnsDownload;
exports.getRequestColumnsMap = getRequestColumnsMap;
exports.getRequestSql = getRequestSql;
exports.getRequests = getRequests;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bbox = require('./bbox');

var _execute = require('./execute');

function getRequestColumnsData(config) {
    return ["'request' AS type", 'cartodb_id', 'can_type', '(added AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function getRequestColumnsDetails(config) {
    return ["'request' AS type", 'cartodb_id', 'can_type', 'can_subtype', 'comment', 'image', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude', '(added AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function getRequestColumnsDownload(config) {
    return ['added', 'can_type', 'can_subtype', 'comment', 'image', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude'];
}

function getRequestColumnsMap(config) {
    return ['*', '(added AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function where(filters, yearRange) {
    var whereConditions = _underscore2['default'].chain(filters).map(function (value, key) {
        switch (key) {
            case 'litter':
                if (value) {
                    return "can_type = 'litter'";
                }
                break;
            case 'recycling':
                if (value) {
                    return "can_type = 'recycling'";
                }
                break;
            case 'sightings':
                if (value) {
                    return 'can_type IS NULL';
                }
                break;
        }
        return null;
    }).filter(function (value) {
        return value !== null;
    }).value();
    var yearCondition,
        where = ' WHERE (' + whereConditions.join(' OR ') + ')';
    if (yearRange) {
        yearCondition = 'extract(year from added) BETWEEN ' + yearRange.start + ' AND ' + yearRange.end;
        where += ' AND ' + yearCondition;
    }
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

function getRequestSql(filters, yearRange, columns, config) {
    if (!columns) {
        columns = getRequestColumnsMap(config);
    }
    var sql = 'SELECT ' + columns.join(',') + ' FROM ' + config.tables.request;
    if (filters || yearRange) {
        sql += ' ' + where(filters, yearRange);
    }
    if (config.mobile) {
        sql += ' LIMIT ' + config.mobileLimit;
    }
    return sql;
}

function getRequests(filters, yearRange, callback, columns, config) {
    var bboxColumns = _underscore2['default'].clone(columns);
    if (filters.bbox) {
        bboxColumns.push((0, _bbox.inBBox)(filters.bbox) + ' AS in_bbox');
        bboxColumns.push((0, _bbox.fromCenterOfBBox)(filters.bbox) + ' AS center_distance');
    }

    (0, _execute.execute)(getRequestSql(filters, yearRange, bboxColumns, config), config.cartodbUser, callback);
}