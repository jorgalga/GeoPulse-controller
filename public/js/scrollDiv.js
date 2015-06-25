$(document).ready(function () {

  var nice = $("html").niceScroll();
  $("#scroller").html($("#scroller").html+' '+nice.version);
  
  $("#scroller").niceScroll({touchbehaviour:true});


});
