
var selectBank = {
  selectedBank: function(){
    // $('.modal-bank-list').on('click', '.modal-bank-item', function(){
    //   $(this).addClass('bank-active').siblings().removeClass('bank-active');
    //   $('.modal').modal('hide');
    //   var bankName = $(this).find('.bank-item-name').html();
    //   var bankCode = $(this).find('input[name=key]').val();
    //   var prevBankCode = $('input[name=bankcode]').val();
    //   $('input[name=bankname]').val(bankName);
    //   $('input[name=bankname]').addClass('select-bank-item');
    //   $('.J_show-bank-list').removeClass('select-bank-' + prevBankCode).addClass('select-bank-' + bankCode);
    //   $('input[name=bankcode]').val(bankCode);
    //   if ($('.J_bank-card-limit').html() !== ''){
    //     $('.J_bank-card-limit').html('');
    //   }
    //   $('.J_bank-card-limit').html($(this).find('.bank-item-limit').html());
    // })
    $('.close-button').on('click', function(){
      $('.modal-bank-list').modal('hide');
    });
  }
};

exports = module.exports = selectBank;

