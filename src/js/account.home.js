'use strict';

var accountHome = {
  jEchart: function(opt){
    var _color;
    var _userfund = opt.userFund;
    var _userPlan = opt.userPlan;
    var _userLoan = opt.userLoan;
    if (_userfund == 0 && _userPlan == 0 &&_userLoan == 0){
      _color = ['#cccccc', '#cccccc', '#cccccc'];
    }else{
      _color = ['#e34346', '#4398f5', '#f69907'];
    }
    var chart = echarts.init($('#J_chart-assert').get(0), 'macarons');
    var option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        position: {right: -100, top: 30}
      },
      color: _color,
      series: [
        {
          name:'资产比例',
          type:'pie',
          radius: ['61%', '75%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: 'center'
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '14'
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data:[
            {value: _userPlan, name:'红利智投'},
            {value: _userLoan, name:'散标债权'},
            {value: _userfund, name:'账户余额'},
          ]
        }
      ]
    };
    chart.setOption(option);
  },
  init: function(opt){
    var me = this;
    me.jEchart(opt);
    if ( !!me._init ) {
      return me;
    }
    me._init = true;
    return me;
  }
};

exports = module.exports = accountHome;
