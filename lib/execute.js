'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.execute = execute;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _qwest = require('qwest');

var _qwest2 = _interopRequireDefault(_qwest);

function execute(sql, user, callback) {
    var cartodbSqlBase = 'https://' + user + '.cartodb.com/api/v2/sql?';
    _qwest2['default'].get(cartodbSqlBase, { q: sql }, { cache: true }).then(function (xhr, data) {
        callback(data.rows);
    });
}