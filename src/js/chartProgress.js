/**
 * echart progerss
 */

exports = module.exports = function(){
  $('.J_chart-progress').each(function(){
    var chart= this._echarts = echarts.init(this);
    var _percent = $(this).data('percent') - 0 || 0;
    var _other = 100 - _percent;
    chart.setOption({
      color: ['#ffffff', '#dbdbdb'],
      animation: true,
      series:[
        {
          type:'pie',
          radius: ['70%', '76%'],
          avoidLabelOverlap: false,
          legendHoverLink: false,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center'
            },
            emphasis: {
              show: false
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            {
              value: _percent
            },
            {
              value: _other
            }
          ]
        }
      ]
    });
  });
};
