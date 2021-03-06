import _ from 'underscore';

import { fromCenterOfBBox, inBBox } from './bbox';
import { execute } from './execute';

export function getRequestColumnsData(config) {
    return [
        "'request' AS type",
        'cartodb_id',
        'can_type',
        `(added AT TIME ZONE '${config.timezone}')::text AS date`
    ];
}

export function getRequestColumnsDetails(config) {
    return [
        "'request' AS type",
        'cartodb_id',
        'can_type',
        'can_subtype',
        'comment',
        'image',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude',
        'name',
        `(added AT TIME ZONE '${config.timezone}')::text AS date`
    ];
}

export function getRequestColumnsDownload(config) {
    return [
        'added',
        'can_type',
        'can_subtype',
        'comment',
        'image',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude'
    ];
}

export function getRequestColumnsMap(config) {
    return [
        '*',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude',
        `(added AT TIME ZONE '${config.timezone}')::text AS date`
    ];
}

function where(filters, yearRange) {
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            switch(key) {
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
        })
        .filter(function (value) { return value !== null; })
        .value();
    var yearCondition,
        where = ` WHERE (${whereConditions.join(' OR ')})`;
    if (yearRange) {
        yearCondition = `extract(year from added) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
        where += ` AND ${yearCondition}`;
    }
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

export function getRequestSql(filters, yearRange, columns, config) {
    if (!columns) {
        columns = getRequestColumnsMap(config);
    }
    var sql = `SELECT ${columns.join(',')} FROM ${config.tables.request}`;
    if (filters || yearRange) {
        sql += ` ${where(filters, yearRange)}`;
    }
    if (config.mobile) {
        sql += ` LIMIT ${config.mobileLimit}`;
    }
    return sql;
}

export function getRequests(filters, yearRange, callback, columns, config) {
    var bboxColumns = _.clone(columns);
    if (filters.bbox) {
        bboxColumns.push(`${inBBox(filters.bbox)} AS in_bbox`);
        bboxColumns.push(`${fromCenterOfBBox(filters.bbox)} AS center_distance`);
    }

    execute(getRequestSql(filters, yearRange, bboxColumns, config), config.cartodbUser, callback);
}
