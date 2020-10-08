var reason ="";

function showImage() {
  $.ajax({
    type: "GET",
    url: 'languages',
    success: function(ret) {
      $('#content .added').remove();
      var template = $('#content template')[0];
      var promises = [];
      $('language',ret).each(function(i,e){
        var clone = document.importNode(template.content, true);
        promises.push(new Promise((resolve, reject) => {
          $('> *',clone).each(function(j,c){
            $(c).addClass('added');
            $(c).attr('lang', e.textContent);
            $.ajax({
              type: "GET",
              url: 'images/' + e.textContent,
              success: function(img) {
                $(c).attr('style','background-image: url("' + img +'")');
                $('#content').append(c);
                resolve(true);
              },
              error: function() {
                reject(false);
                setTimeout(function(){ showImage(); }, 500);
              }
            });
          });
        }));
      });
      Promise.all(promises).then((values) => {
        $.ajax({
          type: "GET",
          url: 'style.url',
          success: function(ret) {
            $('head link.custom').attr('href',ret);
          }
        });
        $.ajax({
          type: "GET",
          url: 'num',
          success: function(num) {
            if (num == 1) {
              $("button[name=first]").addClass('hidden');
              $("button[name=previous]").addClass('hidden');
            } else {
              $("button[name=first]").removeClass('hidden');
              $("button[name=previous]").removeClass('hidden');
            }
            $.ajax({
              type: "GET",
              url: 'total',
              success: function(total) {
                if (num == total) {
                  $("button[name=last]").addClass('hidden');
                  $("button[name=next]").addClass('hidden');
                } else {
                  $("button[name=last]").removeClass('hidden');
                  $("button[name=next]").removeClass('hidden');
                }
              }
            });
          }
        });
        $.ajax({
          type: "GET",
          url: 'errors.xml',
          success: function(ret) {
            $("button[name=error]").removeClass('hidden');
          }
        });
        lang_init('#content','#languages');
        $('#languages').removeClass('hidden');
        $('#nav').removeClass('hidden');
        $('#nope').addClass('hidden');
      });
    },
    error: function() {
      reason = '';
      clearImage();
    }
  });
}
function clearImage() {
  $('#languages').addClass('hidden');
  $('#reasons').addClass('hidden');
  $('#nav').addClass('hidden');
  $('#nav button').addClass('hidden');
  $('#nope').removeClass('hidden');
  $("button").addClass('hidden');
  $('#content .added').remove();
  $('#reason').text(reason);
}

function init() {
  es = new EventSource('sse/');
  es.onopen = function() {
    showImage();
    // load
  };
  es.onmessage = function(e) {
    if (e.data == 'new') {
      reason = '';
      showImage();
    }
    if (e.data == 'reset') {
      reason = '';
      clearImage();
    }
  };
  es.onerror = function() {
    reason = 'Server down.';
    clearImage();
    setTimeout(init, 10000);
  };
}

$(document).ready(function() {
  init();
  $("button[name=next]").click(b_next);
  $("button[name=previous]").click(b_previous);
  $("button[name=error]").click(b_error);
  $("button[name=first]").click(b_first);
  $("button[name=last]").click(b_last);
  $("#reasons").on('click','button',b_reason);
  $('body').keypress(function(e){
    if (e.originalEvent.key == 'a' && !$("button[name=previous]").hasClass('hidden')) {
      b_previous();
    }
    if (e.originalEvent.key == 'c' && !$("button[name=next]").hasClass('hidden')) {
      b_next();
    }
  });
});

function b_previous() {
  $.ajax({
    type: "DELETE",
    data: { op: "prev" },
    url: location.href
  });
}

function b_next() {
  $.ajax({
    type: "DELETE",
    data: { op: "next" },
    url: location.href
  });
}
function b_first() {
  $.ajax({
    type: "DELETE",
    data: { op: "jump", target: 1 },
    url: location.href
  });
}
function b_last() {
  $.ajax({
    type: "DELETE",
    data: { op: "jump", target: -1 },
    url: location.href
  });
}

function b_reason() {
  var reason = $(this).text();
  $('#reasons').toggleClass('hidden');
  $.ajax({
    type: "DELETE",
    data: { op: "error", reason: reason },
    url: location.href
  });
}
function b_error() {
  $.ajax({
    type: "get",
    url: "errors.xml",
    success: function(x) {
      $('#reasons .added').remove();
      var template = $('#reasons template')[0];
      $('reason',x).each((k,v) => {
        var clone = document.importNode(template.content, true);
        $('> *',clone).each((j,c) => {
          $(c).addClass('error added');
          $('button',c).text(v.textContent);
        });
        $('#reasons').append(clone);
      });
      $('#reasons').toggleClass('hidden');
    }
  });
}
