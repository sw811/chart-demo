/**
 * @file echart-demo
 * @author sunwei11
 */

define(
    function (require) {

        var $ = require('jquery');
        var echarts = require('echarts');
        require('echarts/chart/line');
        require('echarts/component/legend');

        var config = {};

        /**
         * 按月展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        function monthCallback(data) {
            var values = [], counts = [];
            data.forEach(function (item) {
                var reg = new RegExp('^.*日.*$');
                var time = item.time;
                if (reg.test(time)) {
                    time = changeStr(time);
                }
                var month = new Date(time).getMonth();

                values[month] = (values[month] || 0) + (+item.value);
                counts[month] = (counts[month] || 0) + 1;
            });
            var result = [];
            for (var i = 0; i < 12; i++) {
                if (counts[i]) {
                    result.push({
                        time: i + 1 + '月',
                        value: values[i] / counts[i]
                    });
                }
            }
            renderTable(result);
        }

        /**
         * 按周展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        function weekCallback(data) {

            var values = [], counts = [];
            data.forEach(function (item) {
                var reg = new RegExp('^.*日.*$');
                var time = item.time;
                if (reg.test(time)) {
                    time = changeStr(time);
                }
                var week = getWeekNumber(time);
                values[week] = (values[week] || 0) + (+item.value);
                counts[week] = (counts[week] || 0) + 1;
            });
            var result = [];

            for (var i = 0; i < 53; i++) {
                if (counts[i]) {
                    result.push({
                        time: '第' + i + '周',
                        value: values[i] / counts[i]
                    });
                }
            }
            renderTable(result);
        }

        /**
         * 根据年份计算这一年有多少周
         *
         * @param  {number} year 传入的年
         * @return {number}   返回的周数
         */
        function getNumOfWeeks(year) {
            var d = new Date(year, 0, 1);
            var yt = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
            return Math.ceil((yt - d.getDay()) / 7.0);

        }

        /**
         * 判断年份是否为润年
         *
         * @param {number} year 传入的年
         * @return {boolen} 是否是闰年
         */
        function isLeapYear(year) {
            return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
        }

        /**
         * 获取某一年份的某一月份的天数
         *
         * @param {number} year 传入的年
         * @param {number} month 传入的月
         */
        function getMonthDays(year, month) {
            return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] || (isLeapYear(year) ? 29 : 28);
        }

        /**
         * 获得某一天是这一年的多少周
         *
         * @param  {string} time 时间
         * @return {number}   周数
         */
        function getWeekNumber(time) {
            var now = new Date(time);
            var year = now.getFullYear();
            var month = now.getMonth();
            var days = now.getDate();

            // 那一天是那一年中的第多少天
            for (var i = 0; i < month; i++) {
                days += getMonthDays(year, i);
            }

            // 那一年第一天是星期几
            var yearFirstDay = new Date(year, 0, 1).getDay() || 7;

            var week = null;
            if (yearFirstDay === 1) {
                week = Math.ceil(days / yearFirstDay);
            }
            else {
                days -= (7 - yearFirstDay + 1);
                week = Math.ceil(days / 7) + 1;
            }

            return week;
        }
        /**
         * 查看日期是否符合格式,不符合格式的日期做转化
         *
         * @return {string} 处理后的日期
         */
        function changeStr (date) {
            var testStr = /[^\d]+/g;
            date = date.replace(testStr, '/').substring(0, date.length - 1);
            return date;

        }

        /**
         * 按天展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        function dayCallback(data) {
            renderTable(data);
        }

        /**
         * 渲染图表的回调函数
         *
         * @param  {Object} data 处理后的数据
         */
        function renderTable(data) {
            var myChart = echarts.init(document.getElementById('table-content'));
            var option = {
                title: {
                    text: 'Confidence Band',
                    subtext: 'Example in MetricsGraphics.js',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: false
                    },
                    formatter: function (params) {
                        return params[2].name + '<br />' + params[2].value;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: data.map(function (item) {
                        return item.time;
                    }),
                    axisLabel: {
                        formatter: function (value, idx) {
                            // var date = new Date(value);
                            return value;
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    boundaryGap: true
                },
                yAxis: {
                    axisLabel: {
                        formatter: function (val) {
                            return val;
                        }
                    },
                    splitNumber: 5,
                    splitLine: {
                        show: true
                    }
                },
                series: [{
                    name: 'L',
                    type: 'line',
                    data: data.map(function (item) {
                        return item.time;
                    }),
                    lineStyle: {
                        normal: {
                            opacity: 0
                        }
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                }, {
                    name: 'U',
                    type: 'line',
                    data: data.map(function (item) {
                        return item.value;
                    }),
                    lineStyle: {
                        normal: {
                            opacity: 0
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: '#ccc'
                        }
                    },
                    stack: 'confidence-band',
                    symbol: 'none'
                }, {
                    type: 'line',
                    data: data.map(function (item) {
                        return item.value;
                    }),
                    hoverAnimation: false,
                    symbolSize: 6,
                    itemStyle: {
                        normal: {
                            color: '#c23531'
                        }
                    },
                    showSymbol: false
                }]
            };
            myChart.setOption(option);
        }

        /**
         * 初始化
         */
        config.init = function () {
            var myChart = echarts.init(document.getElementById('table-content'));
            myChart.showLoading();
            $.get('mock/textOne.json', function (data) {
                myChart.hideLoading();
                renderTable(data);
                // 按月展示事件绑定
                $('.wrapper').on('click', '.month-btn', function () {
                    monthCallback(data);
                });
                // 按周展示事件绑定
                $('.wrapper').on('click', '.week-btn', function () {
                    weekCallback(data);
                });
                // 按天展示事件绑定
                $('.wrapper').on('click', '.day-btn', function () {
                    dayCallback(data);
                });
            });


        };
        return config;
    }
);

