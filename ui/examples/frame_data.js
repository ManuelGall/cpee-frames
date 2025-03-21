function showDocument(fr = "") {
  if(fr != ""){
    $.ajax({
      type: "GET",
      url: 'dataelements.json',
      success: function(ret) {
        $("#alldata").text(JSON.stringify(ret));
      },
      error: function() {
        reason = '';
        clearDocument();
      }
    });
  }
}

function clearDocument() { }

function init() {
  es = new EventSource('handler/sse/');
  es.onopen = function() {
    showDocument("FormTest");
    // load
  };
  es.onmessage = function(e) {
    if (e.data == 'new') {
      reason = '';
      showDocument();
    }
    if (e.data == 'reset') {
      reason = '';
      showDocument();
    }
    else{
      if(e.data != "keepalive" && e.data != "started"){
        try {
          showDocument(e.data);
        }
        catch (e) {
        }
      }

    }
  };
  es.onerror = function() {
    reason = 'Server down.';
    clearDocument();
    setTimeout(init, 10000);
  };
}

$(document).ready(function() {
  init();
});

