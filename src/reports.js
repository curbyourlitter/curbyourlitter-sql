import _ from 'underscore';

import { fromCenterOfBBox, inBBox } from './bbox';
import { execute } from './execute';

export function getReportColumnsData(config) {
    return [
        "'report' AS type",
        'complaint_type',
        'cartodb_id',
        'incident_address',
        'intersection_street1',
        'intersection_street2',
        `(created_date AT TIME ZONE '${config.timezone}')::text AS date`
    ];
}

export function getReportColumnsDetails(config) {
    return [
        "'report' AS type",
        'r.complaint_type',
        'r.cartodb_id',
        'r.descriptor',
        'r.incident_address',
        'r.intersection_street1',
        'r.intersection_street2',
        'ST_X(r.the_geom) AS longitude',
        'ST_Y(r.the_geom) AS latitude',
        `(r.created_date AT TIME ZONE '${config.timezone}')::text AS date`,
        'c.description'
    ];
}

export function getReportColumnsDownload(config) {
    return [
        'complaint_type',
        'descriptor',
        'incident_address',
        'location_type',
        'status',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude'
    ];
}

export function getReportColumnsMap(config) {
    return [
        '*',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude',
        `(created_date AT TIME ZONE '${config.timezone}')::text AS date`
    ];
}

function where(filters, yearRange) {
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
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
        })
        .filter(function (value) { return value !== null; })
        .value();
    var yearCondition,
        where = ` WHERE (${whereConditions.join(' OR ')})`;
    if (yearRange) {
        yearCondition = `extract(year from created_date) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
        where += ` AND ${yearCondition}`;
    }
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

export function getReportSql(filter, yearRange, columns, config) {
    if (!columns) {
        columns = getReportColumnsMap(config);
    }
    var sql = `SELECT ${columns} FROM ${config.tables.report} `;
    if (filter || yearRange) {
        sql += ` ${where(filter, yearRange)}`;
    }
    if (config.mobile) {
        sql += ` ORDER BY created_date DESC LIMIT ${config.mobileLimit}`;
    }
    return sql;
}

export function getReportSqlDetails(id, config) {
    var columns = getReportColumnsDetails(config);
    return `SELECT ${columns.join(',')} FROM ${config.tables.report} r LEFT JOIN ${config.tables.reportCodes} c ON r.descriptor = c.code WHERE r.cartodb_id = ${id}`;
}

export function getReports(filters, yearRange, callback, columns, config) {
    var bboxColumns = _.clone(columns);
    if (filters.bbox) {
        bboxColumns.push(`${inBBox(filters.bbox)} AS in_bbox`);
        bboxColumns.push(`${fromCenterOfBBox(filters.bbox)} AS center_distance`);
    }

    execute(getReportSql(filters, yearRange, bboxColumns, config), config.cartodbUser, callback);
}
