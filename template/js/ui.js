var reason ="";


function showDocument() {
  
  $.ajax({
    type: "GET",
    url: 'info.json',
    success: function(ret) {
      makeGrid(ret.x_amount, ret.y_amount);
      $.ajax({
        type: "GET",
        url: 'frames.json',
        success: function(ret2) {
          for (i in ret2.data) {
            makeFrame(ret2.data[i].lx,ret2.data[i].ly,ret2.data[i].rx,ret2.data[i].ry, ret2.data[i].url);
          }
        }
      });
    },
    error: function() {
      reason = '';
      clearDocument();
    }
  });
  
  
  
  
  /*
  $.ajax({
    type: "GET",
    url: 'languages',
    success: function(ret) {
      $('#content .added').remove();
      $('#control .added').remove();
      var ctemplate = $('#content template')[0];
      var btemplate = $('#control template')[0];
      var promises = [];
      $('language',ret).each(function(i,e){
        var cclone = document.importNode(ctemplate.content, true);
        var bclone = document.importNode(btemplate.content, true);
        promises.push(new Promise((resolve, reject) => {
          $('> *',cclone).each(function(j,c){
            $(c).addClass('added');
            $(c).attr('lang', e.textContent);
            $.ajax({
              type: "GET",
              url: 'documents/' + e.textContent,
              success: function(doc) {
                if (c.nodeName == 'IFRAME') {
                  $(c).attr('src',doc);
                } else {
                  $('iframe',c).attr('src',doc);
                }
                $('#content').append(c);
                resolve(true);
              },
              error: function() {
                reject(false);
                setTimeout(function(){ showDocument(); }, 500);
              }
            });
          });
        }));
        promises.push(new Promise((resolve, reject) => {
          $('> *',bclone).each(function(j,c){
            $(c).addClass('added');
            $(c).attr('lang', e.textContent);
            $.ajax({
              type: "GET",
              url: 'buttons/' + e.textContent,
              success: function(but) {
                if (c.nodeName == 'BUTTON') {
                  $(c).text(but);
                } else {
                  $('button',c).text(but);
                }
                $('#control').append(c);
                resolve(true);
              },
              error: function() {
                resolve(true);
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
        lang_init('#content','#languages');
        $('#languages').removeClass('hidden');
        $('#nope').addClass('hidden');
      });
    },
    error: function() {
      reason = '';
      clearDocument();
    }
  });
  */
}


function clearDocument() {
  console.log('rrrr');
  $('#languages').addClass('hidden');
  $('#nope').removeClass('hidden');
  $('#control .added').remove();
  $('#content .added').remove();
  $('#reason').text(reason);
}


function init() {
  es = new EventSource('sse/');
  es.onopen = function() {
    showDocument();
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
          //alert(e.data)
          var frd = JSON.parse(e.data)
          makeFrame(frd.lx,frd.ly,frd.rx,frd.ry, frd.url);
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



function makeGrid(x, y) {
  const container = document.getElementById("container");
  container.style.setProperty('--grid-rows', y);
  container.style.setProperty('--grid-cols', x);
  /*
  for (c = 0; c < (x * y); c++) {
    let cell = document.createElement("div");
    //cell.innerText = (c + 1);
    cell.classList.add("item" + (c% y) + "-" + (Math.floor(c / y ))); 
    
    cell.classList.add("grid-item");

    container.appendChild(cell);
  };
  */
};




$(document).ready(function() {
  $('#control').on('click','button[name=send]',b_send);
  init();
});

function b_send() {
  var formData = new FormData();
  var content = JSON.stringify($('iframe:visible')[0].contentWindow.send_it());
  var blob = new Blob([content], { type: "application/json"});

  formData.append("op", "result");
  formData.append("value", blob);

  var request = new XMLHttpRequest();
  request.open("DELETE", location.href);
  request.send(formData);
}
