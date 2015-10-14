import qwest from 'qwest';

export function execute(sql, user, callback) {
    var cartodbSqlBase = `https://${user}.cartodb.com/api/v2/sql?`;
    qwest.get(cartodbSqlBase, { q: sql }, { cache: true })
        .then((xhr, data) => {
            callback(data.rows);
        });
}
