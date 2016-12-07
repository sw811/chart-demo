/**
 * @file echart-demo
 * @author sunwei11
 */

define(
    function (require) {

        var $ = require('jquery');
        var echarts = require('echarts');
        var markLineExtension = require('markLine');
        require('echarts/chart/line');
        require('echarts/component/toolbox');
        require('echarts/component/legend');
        require('echarts/component/markLine');
        require('echarts/component/markPoint');
        require('echarts/component/markArea');

        var config = {};

        /**
         * 按月展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        config.monthCallback = function () {
            $('.tool-bars').find('.btn-checked').removeClass('btn-checked');
            $('.month-btn').addClass('btn-checked');
            this.currentFlag = 1;
            var result = this.getMonthData();
            this.renderTable(result);
        };

        /**
         * 获取周粒度处理的数据
         *
         * @return {Array} 周粒度数据
         */
        config.getWeekData = function () {

            var data = this.data;
            var values = [], counts = [];
            data.forEach(function (item) {
                var reg = new RegExp('[年月日]');
                var time = item.x;
                if (reg.test(time)) {
                    time = changeStr(time);
                }
                var week = getWeekNumber(time);
                values[week] = (values[week] || 0) + (+item.y);
                counts[week] = (counts[week] || 0) + 1;
            });
            var result = [];

            for (var i = 0; i < 53; i++) {
                if (counts[i]) {
                    result.push({
                        x: '第' + i + '周',
                        y: values[i] / counts[i]
                    });
                }
            }
            return result;
        };

        /**
         * 获取月粒度处理的数据
         *
         * @return {Array} 月粒度数据
         */
        config.getMonthData = function () {

            var data = this.data;
            var values = [], counts = [];
            data.forEach(function (item) {
                var reg = new RegExp('[年月日]');
                var time = item.x;
                if (reg.test(time)) {
                    time = changeStr(time);
                }
                var month = new Date(time).getMonth();

                values[month] = (values[month] || 0) + (+item.y);
                counts[month] = (counts[month] || 0) + 1;
            });
            var result = [];
            for (var i = 0; i < 12; i++) {
                if (counts[i]) {
                    result.push({
                        x: i + 1 + '月',
                        y: values[i] / counts[i]
                    });
                }
            }
            return result;
        };

        /**
         * 按周展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        config.weekCallback = function () {
            $('.tool-bars').find('.btn-checked').removeClass('btn-checked');
            $('.week-btn').addClass('btn-checked');
            this.currentFlag = 2;
            var result = this.getWeekData();
            this.renderTable(result);
        };

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
         * 将不符合格式的日期做转化
         *
         * @return {string} 处理后的日期
         */
        function changeStr(date) {
            var testStr = /[^\d]+/g;
            date = date.replace(testStr, '/').substring(0, date.length - 1);
            return date;

        }

        /**
         * 按天展示点击事件的回调函数
         *
         * @param  {Object} data 未处理的全部数据
         */
        config.dayCallback = function () {
            $('.tool-bars').find('.btn-checked').removeClass('btn-checked');
            $('.day-btn').addClass('btn-checked');
            this.currentFlag = 0;
            this.renderTable(this.data);
        };


        /**
         * 生成年月日切换按钮的dom
         */
        // config.createChangeTimeHtml = function () {
        //     var html = ''
        //         + '<div class="tool-mark">'
        //         +   '<div class="tool-main">'
        //         +       '<span class="week-btn">周</span>'
        //         +       '<span class="month-btn">月</span>'
        //         +       '<span class="day-btn">日</span>'
        //         +   '</div>'
        //         +   '<div class="tool-extend"></div>'
        //         + '</div>';
        // };



        /**
         * 渲染图表的回调函数
         *
         * @param  {Object} data 处理后的数据
         */
        config.renderTable = function (data) {
            var ydata = data.map(function (item) {
                        return item.y;
                    });
            var option = {
                title: {
                    text: 'chart-demo',
                    subtext: 'chart-demo',
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
                toolbox: {
                    feature: {
                        myTool1: {
                            show: true,
                            title: '时间维度切换',
                            icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
                            onclick: function () {

                            }
                        }
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
                        return item.x;
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
                    type: 'line',
                    data: ydata,
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
            this.echartsOptions = option;
            this.getCurrentData();
            this.myChart.setOption(option);
        };

        /**
         * 获取当前渲染的数据
         *
         * @param  {Object} data 当前的数据
         * @public
         */
        config.getCurrentData = function () {
            var data = this.data;
            if (this.currentFlag === 0) {
                data = this.data;
            }
            else if (this.currentFlag === 1 ) {
                data = this.getMonthData();
            }
            else {
                data = this.getWeekData();
            }
            return data;
        };

        /**
         * 初始化
         */
        config.init = function () {
            var me = this;
            this.myChart = echarts.init(document.getElementById('table-content'));
            this.myChart.showLoading();

            $.get('mock/textTwo.json', function (data) {
                me.data = data;
                me.currentFlag = 0;
                me.myChart.hideLoading();

                me.renderTable(data);

                // 按月展示事件绑定
                $('.wrapper').on('click', '.month-btn', function () {
                    me.monthCallback();
                });
                // 按周展示事件绑定
                $('.wrapper').on('click', '.week-btn', function () {
                    me.weekCallback();
                });
                // 按天展示事件绑定
                $('.wrapper').on('click', '.day-btn', function () {
                    me.dayCallback();
                });

                markLineExtension.init({
                    toolBar: $('.tool-bars')[0],
                    data: me.getCurrentData(),
                    echartsOptions: me.echartsOptions,
                    echarts: me.myChart
                });
            });


        };
        return config;
    }
);

