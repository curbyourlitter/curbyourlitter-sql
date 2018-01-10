import _ from 'underscore';

import { fromCenterOfBBox, inBBox } from './bbox';
import { execute } from './execute';

export function getInstalledCanColumnsData(config) {
    return [
        "'installedcan' AS type",
        'type AS cantype',
        'cartodb_id',
        'name'
    ];
}

export function getInstalledCanColumnsDetails(config) {
    return [
        "'installedcan' AS type",
        'type AS cantype',
        'cartodb_id',
        'name',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude'
    ];
}

export function getInstalledCanColumnsMap(config) {
    return [
        '*',
        'ST_X(the_geom) AS longitude',
        'ST_Y(the_geom) AS latitude'
    ];
}

function where(filters) {
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            return null;
        })
        .filter(function (value) { return value !== null; })
        .value();
    var where = '';
    if (whereConditions.length !== 0) {
        where = ` WHERE ${whereConditions.join(' OR ')}`;
    }
    return where;
}

export function getInstalledCanSql(filters, columns, config) {
    if (!columns) {
        columns = getInstalledCanColumnsMap(config);
    }
    var sql = `SELECT ${columns} FROM ${config.tables.installedcan} `;
    if (filters) {
        sql += ` ${where(filters)}`;
    }
    if (config.mobile) {
        sql += ` LIMIT ${config.mobileLimit}`;
    }
    return sql;
}

export function getInstalledCans(filters, callback, columns, config) {
    var bboxColumns = _.clone(columns);
    if (filters.bbox) {
        bboxColumns.push(`${inBBox(filters.bbox)} AS in_bbox`);
        bboxColumns.push(`${fromCenterOfBBox(filters.bbox)} AS center_distance`);
    }

    execute(getInstalledCanSql(filters, bboxColumns, config), config.cartodbUser, callback);
}
