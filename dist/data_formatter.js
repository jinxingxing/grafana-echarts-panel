'use strict';

System.register(['lodash', './geohash', './china_city_mapping'], function (_export, _context) {
  "use strict";

  var _, decodeGeoHash, py2hz, _createClass, DataFormatter;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_geohash) {
      decodeGeoHash = _geohash.default;
    }, function (_china_city_mapping) {
      py2hz = _china_city_mapping.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      DataFormatter = function () {
        function DataFormatter(ctrl, kbn) {
          _classCallCheck(this, DataFormatter);

          this.ctrl = ctrl;
          this.kbn = kbn;
        }

        _createClass(DataFormatter, [{
          key: 'setValues',
          value: function setValues(data) {
            var _this = this;

            if (this.ctrl.series && this.ctrl.series.length > 0) {
              var highestValue = 0;
              var lowestValue = Number.MAX_VALUE;

              this.ctrl.series.forEach(function (serie) {
                var lastPoint = _.last(serie.datapoints);
                var lastValue = _.isArray(lastPoint) ? lastPoint[0] : null;
                var location = _.find(_this.ctrl.locations, function (loc) {
                  return loc.key.toUpperCase() === serie.alias.toUpperCase();
                });

                if (!location) return;

                if (_.isString(lastValue)) {
                  data.push({ key: serie.alias, value: 0, valueFormatted: lastValue, valueRounded: 0 });
                } else {
                  var dataValue = {
                    key: serie.alias,
                    locationName: location.name,
                    locationLatitude: location.latitude,
                    locationLongitude: location.longitude,
                    value: serie.stats[_this.ctrl.panel.valueName],
                    valueFormatted: lastValue,
                    valueRounded: 0
                  };

                  if (dataValue.value > highestValue) highestValue = dataValue.value;
                  if (dataValue.value < lowestValue) lowestValue = dataValue.value;

                  dataValue.valueRounded = _this.kbn.roundValue(dataValue.value, parseInt(_this.ctrl.panel.decimals, 10) || 0);
                  data.push(dataValue);
                }
              });

              data.highestValue = highestValue;
              data.lowestValue = lowestValue;
              data.valueRange = highestValue - lowestValue;
            }
          }
        }, {
          key: 'setGeohashValues',
          value: function setGeohashValues(dataList, data) {
            var _this2 = this;

            if (!this.ctrl.panel.esMetric) return;
            if (!this.ctrl.panel.esGeoPoint && !this.ctrl.panel.esLocationName) return;

            if (dataList && dataList.length > 0) {
              var highestValue = 0;
              var lowestValue = Number.MAX_VALUE;
              console.info('setGeohashValues...');
              dataList[0].datapoints.forEach(function (datapoint) {
                var dataValue = {
                  name: _this2.ctrl.panel.esLocationName ? py2hz(datapoint[_this2.ctrl.panel.esLocationName]) : datapoint[_this2.ctrl.panel.esGeoPoint],
                  value: datapoint[_this2.ctrl.panel.esMetric]
                };

                if (dataValue.value > highestValue) highestValue = dataValue.value;
                if (dataValue.value < lowestValue) lowestValue = dataValue.value;

                dataValue.valueRounded = _this2.kbn.roundValue(dataValue.value, _this2.ctrl.panel.decimals || 0);
                data.push(dataValue);
              });

              data.highestValue = highestValue;
              data.lowestValue = lowestValue;
              data.valueRange = highestValue - lowestValue;
            }
          }
        }, {
          key: 'setTableValues',
          value: function setTableValues(tableData, data) {
            var _this3 = this;

            if (tableData && tableData.length > 0) {
              var highestValue = 0;
              var lowestValue = Number.MAX_VALUE;

              tableData[0].forEach(function (datapoint) {
                if (!datapoint.geohash) {
                  return;
                }

                var encodedGeohash = datapoint.geohash;
                var decodedGeohash = decodeGeoHash(encodedGeohash);

                var dataValue = {
                  key: encodedGeohash,
                  locationName: datapoint[_this3.ctrl.panel.tableLabel] || 'n/a',
                  locationLatitude: decodedGeohash.latitude,
                  locationLongitude: decodedGeohash.longitude,
                  value: datapoint.metric,
                  valueFormatted: datapoint.metric,
                  valueRounded: 0
                };

                if (dataValue.value > highestValue) highestValue = dataValue.value;
                if (dataValue.value < lowestValue) lowestValue = dataValue.value;

                dataValue.valueRounded = _this3.kbn.roundValue(dataValue.value, _this3.ctrl.panel.decimals || 0);
                data.push(dataValue);
              });

              data.highestValue = highestValue;
              data.lowestValue = lowestValue;
              data.valueRange = highestValue - lowestValue;
            }
          }
        }, {
          key: 'aggByProvince',
          value: function aggByProvince(data) {
            if (!data || data.length == 0) return [];

            var sum = function sum(total, item) {
              return total += item.value;
            };
            var ret = _.chain(data).groupBy('name').map(function (group, name) {
              return { name: name, value: _.reduce(group, sum, 0) };
            }).value();

            return ret;
          }
        }], [{
          key: 'tableHandler',
          value: function tableHandler(tableData) {
            var datapoints = [];

            if (tableData.type === 'table') {
              var columnNames = {};

              tableData.columns.forEach(function (column, columnIndex) {
                columnNames[columnIndex] = column.text;
              });

              tableData.rows.forEach(function (row) {
                var datapoint = {};

                row.forEach(function (value, columnIndex) {
                  var key = columnNames[columnIndex];
                  datapoint[key] = value;
                });

                datapoints.push(datapoint);
              });
            }

            return datapoints;
          }
        }]);

        return DataFormatter;
      }();

      _export('default', DataFormatter);
    }
  };
});
//# sourceMappingURL=data_formatter.js.map
