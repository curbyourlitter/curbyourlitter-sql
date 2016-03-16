export function getRatingsColumnsDownload(config) {
    return [
        'ST_AsEWKT(streets.the_geom) AS the_geom',
        'streets.stname_lab AS street',
        'streets.cross_streets AS cross_streets',
        'ratings.collected',
        'ratings.rating'
    ];
}

// TODO latest rather than avg
export function getRatingsColumnsMap(config) {
    return [
        'ST_collect(streets.the_geom_webmercator) AS the_geom_webmercator',
        'AVG(ratings.rating) AS avg',
        'streets.priority AS priority'
    ];
}

function where(filters, yearRange) {
    var yearCondition = `extract(year from collected) BETWEEN ${yearRange.start} AND ${yearRange.end}`;
    var whereConditions = _.chain(filters)
        .map(function (value, key) {
            if (value) {
                return `rating = ${key}`;
            }
            return null;
        })
        .filter(function (value) {
            return value !== null;
        })
        .value();
    var where = ` WHERE  ${yearCondition} AND (${whereConditions.join(' OR ')})`;
    if (whereConditions.length === 0) {
        // Intentionally pick nothing
        where = ' WHERE true = false';
    }
    return where;
}

export function getRatingSql(filter, yearRange, columns, config, group = false) {
    if (!columns) {
        columns = getRatingsColumnsMap(config);
    }
    var sql = `SELECT ${columns} FROM ${config.tables.ratings} ratings LEFT JOIN ${config.tables.streets} ON ratings.segment_id = streets.cartodb_id`;
    if (filter || yearRange) {
        sql += ` ${where(filter, yearRange)}`;
    }
    if (group) {
        sql += ' GROUP BY streets.cartodb_id';
    }
    return sql;
}
