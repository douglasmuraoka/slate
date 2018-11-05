$(function() {
  $('.dropdown').click(function() {
    $(this).next('.dropdown-menu').toggle();
  });
  $(document).click(function(e) {
    var target = e.target;
    if (!$(target).is('.dropdown') && !$(target).parents().is('.dropdown')) {
      $('.dropdown-menu').hide();
    }
  });
});
