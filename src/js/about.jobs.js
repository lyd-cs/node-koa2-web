'use strict';

var aboutUs = {
  slider: function(){
    $('#J_about-job').on('click', '.J_job-info', function(){
      var $condition = $(this).siblings('.J_condition');
      var $temp = $condition.hasClass('selected');
      if($temp){
        $condition.removeClass('selected');
      }else{
        $condition.addClass('selected');
      }
    });
  }
};

exports = module.exports = aboutUs;
