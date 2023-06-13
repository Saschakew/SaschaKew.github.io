$(document).ready(function() {
  $('.abstract-toggle').click(function() {
    $(this).closest('li').find('.abstract').toggle();
  });
});
