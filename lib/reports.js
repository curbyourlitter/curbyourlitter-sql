'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.getReportColumnsData = getReportColumnsData;
exports.getReportColumnsDetails = getReportColumnsDetails;
exports.getReportColumnsDownload = getReportColumnsDownload;
exports.getReportColumnsMap = getReportColumnsMap;
exports.getReportSql = getReportSql;
exports.getReports = getReports;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bbox = require('./bbox');

var _execute = require('./execute');

function getReportColumnsData(config) {
    return ["'report' AS type", 'complaint_type', 'cartodb_id', 'incident_address', 'intersection_street1', 'intersection_street2', '(created_date AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function getReportColumnsDetails(config) {
    return ["'report' AS type", 'complaint_type', 'cartodb_id', 'descriptor', 'incident_address', 'intersection_street1', 'intersection_street2', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude', '(created_date AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function getReportColumnsDownload(config) {
    return ['complaint_type', 'descriptor', 'incident_address', 'location_type', 'status', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude'];
}

function getReportColumnsMap(config) {
    return ['*', 'ST_X(the_geom) AS longitude', 'ST_Y(the_geom) AS latitude', '(created_date AT TIME ZONE \'' + config.timezone + '\')::text AS date'];
}

function where(filters, yearRange) {
    var whereConditions = _underscore2['default'].chain(filters).map(function (value, key) {
        if (key === 'sanitation_conditions' && value) {
            return "descriptor IN ('15 Street Cond/Dump-Out/Drop-Off')";
        }
        if (key === 'overflowing_litter_basket' && value) {
            return "descriptor IN ('6 Overflowing Litter Baskets')";
        }
        if (key === 'dirty_conditions' && value) {
            return "descriptor IN ('E1 Improper Disposal', 'E2 Receptacle Violation', 'E3 Dirty Sidewalk', 'E3A Dirty Area/Alleyway', 'E5 Loose Rubbish', 'E11 Litter Surveillance', 'E12 Illegal Dumping Surveillance')";
        }
        return null;
    }).filter(function (value) {
        return value !== null;
    }).value();
    var yearCondition,
        where = ' WHERE (' + whereConditions.join(' OR ') + ')';
    if (yearRange) {
        yearCondition = 'extract(year from created_date) BETWEEN ' + yearRange.start + ' AND ' + yearRange.end;
        where += ' AND ' + yearCondition;
    }
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

function getReportSql(filter, yearRange, columns, config) {
    if (!columns) {
        columns = getReportColumnsMap(config);
    }
    var sql = 'SELECT ' + columns + ' FROM ' + config.tables.report + ' ';
    if (filter || yearRange) {
        sql += ' ' + where(filter, yearRange);
    }
    if (config.mobile) {
        sql += ' LIMIT ' + config.mobileLimit;
    }
    return sql;
}

function getReports(filters, yearRange, callback, columns, config) {
    var bboxColumns = _underscore2['default'].clone(columns);
    if (filters.bbox) {
        bboxColumns.push((0, _bbox.inBBox)(filters.bbox) + ' AS in_bbox');
        bboxColumns.push((0, _bbox.fromCenterOfBBox)(filters.bbox) + ' AS center_distance');
    }

    (0, _execute.execute)(getReportSql(filters, yearRange, bboxColumns, config), config.cartodbUser, callback);
}