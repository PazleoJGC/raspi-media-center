var duration, position;

$('#pause').on('click', function () {
  $.ajax({ type: 'GET', url: '/api/pause' });
});

$('#stop').on('click', function () {
  $.ajax({ type: 'GET', url: '/api/stop' });
});

function niceTimeFormat (s) {
  var msg = s + ' %';
  return msg;
}


function updatePositionText () {
  var msg = niceTimeFormat(position);
  $('#position').html(msg);
}


$(document).ready(function () {
  var changingSlider = false;
  position = 0;
  updatePositionText();

  // Once drag is finished, update final position and server
  $('#positionSlider').on('change', function (e) {
    setTimeout(function () {   // Prevent small glitch
      changingSlider = false;
    }, 3000);
    position = parseInt($('#positionSlider').val(), 10);
    updatePositionText();
    $.ajax({ type: 'POST', url: '/api/position'
       , dataType: 'json', contentType:"application/json; charset=utf-8"
       , data: JSON.stringify({ position: position }) });
  });
});
