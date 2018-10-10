'use strict';

var aboutCompany = {
  jEchart: function(){
    var _color = ['#F55150', '#4398f5', '#f69907'];
    var piePeople = echarts.init($('#J_pie-people').get(0), 'macarons');
    var pieAge = echarts.init($('#J_pie-age').get(0), 'macarons');
    var pieEducation = echarts.init($('#J_pie-education').get(0), 'macarons');
    var employeeDate = [
        [
          {value:25, name:'风控'},
          {value:19, name:'技术'},
          {value:24, name:'其他'},
        ],
        [
          {value:21, name:'20~25岁'},
          {value:25, name:'26~30岁'},
          {value:22, name:'31~55岁'},
        ],
        [
          {value:3, name:'研究生及以上'},
          {value:41, name:'本科'},
          {value:24, name:'本科以下'},
        ]
    ];
    var option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      color: _color,
      series : [
        {
          name:'员工信息',
          type:'pie',
          radius: ['50%', '85%'],
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
          data:[],
        }
      ]
    };
    if ($('#J_pie-people')){
        option.series[0].data = employeeDate[0];
        piePeople.setOption(option);
      }
      if ($('#J_pie-age')){
        option.series[0].data = employeeDate[1];
        pieAge.setOption(option);
      }
      if ($('#J_pie-education')){
        option.series[0].data = employeeDate[2];
        pieEducation.setOption(option);
      }
  },
  abooutCompanyEvent: function(){
    $('#J_shareholder_information').on('click', function(){
       $('#J_shares_popups').show();
    });
    $('#J_shares_popups_disappear').on('click', function(){
        $('#J_shares_popups').hide();
     });
  },
  init: function(){
    var me = this;
    me.jEchart();
    me.abooutCompanyEvent();
    if ( !!me._init ) {
      return me;
    }
    me._init = true;
    return me;
  }
};

exports = module.exports = aboutCompany;
