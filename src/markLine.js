/**
 * @file echart 标记线扩展
 * @author varsha
 */

define(function () {

    function getMedian(data) {
        return (Math.max.apply(null, data) + Math.min.apply(null, data)) / 2;
    }

    var exports = {};

    exports.markLineDraw = function (type) {
        var config = this.getLineConfigs(type);

        if (this.markLineData[type] == null) {
            this.markLineData[type] = config;
        }
        else {
            this.markLineData[type] = null;
        }

        this.renderOptions();
    }

    exports.renderOptions = function () {
        var data = [];
        $.each(this.markLineData, function (key, value) {
            if (value != null) {
                data.push(value);
            }
        });

        var options = this.echarts.getOption();

        if (data.length !== 0) {
            options['series'][0].markLine = {
                data: data
            };
        }
        else {
            options['series'][0].markLine = null;
        }

        // debugger;
        console.log(options);
        this.echarts.setOption(options);
    }

    exports.getLineConfigs = function (type) {
        return configs = this[type + 'Configs']();
    };

    exports.avgConfigs = function () {
        return {
            name: '平均值',
            type: 'average'
        };
    };

    exports.medianConfigs = function () {
        var median = getMedian(this.yData);
        return {
            name: '中位数',
            yAxis: median
        };
    };


    exports.initDom = function (wrapper) {

        // Todo: markLine类型可配置
        var html = ''
            + '<div data-role="mark-line-wrapper">'
            + '    <div data-role="mark-line-btn" data-type="avg">平均值</div>'
            + '    <div data-role="mark-line-btn" data-type="median">中位数</div>'
            + '</div>';

        $(wrapper).append(html);
    }

    exports.initEvent = function () {
        var me = this;
        $('[data-role=mark-line-btn]').on('click', function () {
            var btn = $(this);
            btn.toggleClass('active');
            var type = btn.attr('data-type');
            me.markLineDraw(type);
        });
    }

    exports.init = function (options) {

        this.echarts = options.echarts;
        this.yData = options.data.map(function (item) {
            return item.y;
        });
        this.echartsOptions = options.echartsOptions;

        this.markLineData = {};

        this.initDom(options.toolBar);
        this.initEvent();
    }

    return exports;
});
