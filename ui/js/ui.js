var reason = "";
var storage = []; //{col:1, row:1, colamount:1, rowamount: 1}];

function doOverlap(l1x, l1y, r1x, r1y, l2x, l2y, r2x, r2y) {
  // If one rectangle is on left side of other
  if (l1x > r2x || l2x > r1x)
      return false;
  // If one rectangle is above other
  if (l1y > r2y || l2y > r1y)
      return false;
  return true;
}

function makeFrame(lx, ly, rx, ry, content = "", id = "", defaultpara = "", showbutton = "", style = "") {
  //check if rects overlap if they do remove old ones
  for (i = 0; i < window.storage.length; i++) {
    if(doOverlap(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry, lx, ly, rx, ry)){
      $(".item" + window.storage[i].lx + "-" + window.storage[i].ly).remove();
      window.storage.splice(i,1);
      --i;
    }
  }
  if(content != "empty"){
    //add new ellement to storage
    window.storage.push({lx:lx, ly:ly, rx:rx, ry: ry})

    const container = document.getElementById("container");
    let cell = document.createElement("div");
    cell.classList.add("grid-item");
    cell.classList.add("item" + lx + "-" + ly);

    spancol = ''
    if (rx-lx+1 > 1) {
      spancol = " / span " + (rx-lx+1);
    }

    spanrow = '';
    if (ry-ly+1 > 1) {
      spanrow = " / span " + (ry-ly+1);
    }

    jQuery.cssNumber.gridColumnStart = true;
    jQuery.cssNumber.gridColumnEnd = true;
    jQuery.cssNumber.gridRowStart = true;
    jQuery.cssNumber.gridRowEnd = true;

    $(cell).css({"grid-column": (lx+1) + spancol,  "grid-row": ly+1 + spanrow});

    container.appendChild(cell);

    if(content != null && content != ""){
      let fullurl = encodeURI(content);
      let iframe= $("<iframe style='height: 100%; width: 100%' src=\"" + fullurl + "\" title='' frameBorder='0'></iframe>")[0];
      iframe.onload = () => { iframe.contentWindow.postMessage({ data: defaultpara, callback: id }, fullurl); };
      $(".item" + lx + "-" + ly).html(iframe);
    } else{
      $(".item" + lx + "-" + ly).html("No language available.<br> Nicht in der Sprache verfügbar.");
    }
  }
}

function showDocument() {
  $.ajax({
    type: "GET",
    url: 'style.url',
    success: function(ret) {
      $('head link.custom').attr('href',ret);
    }
  });

  $.ajax({
    type: "GET",
    url: 'info.json',
    success: function(ret) {
      makeGrid(ret.x_amount, ret.y_amount);
      //set name
      document.title = ret.document_name;
      $.ajax({
        type: "GET",
        url: 'frames.json',
        success: function(ret2) {
          for (i of ret2.data) {
            makeFrame(i.lx,i.ly,i.rx,i.ry, i.url, i.callback, i.default, i.showbutton, i.style);
          }
        }
      });
    },
    error: function() {
      reason = '';
      clearDocument();
    }
  });
}

function clearDocument() {
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
      if(e.data == "update"){
        alert("update")
      }
      if(e.data != "keepalive" && e.data != "started"){
        try {
          //alert(e.data)
          var frd = JSON.parse(e.data)
          makeFrame(frd.lx,frd.ly,frd.rx,frd.ry, frd.url, frd.callback, frd.default, frd.showbutton, frd.style);
        }
        catch (e) {
        }
      }
    }
  };
  es.onerror = function() {
    reason = 'Server down.';
    clearDocument();
    es.close();
    setTimeout(init, 10000);
  };
}

function makeGrid(x, y) {
  const container = document.getElementById("container");
  container.style.setProperty('--grid-rows', y);
  container.style.setProperty('--grid-cols', x);
};

$(document).ready(function() {
  init();
});

