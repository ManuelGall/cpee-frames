var reason ="";
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
      //clearRectangel(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry)
      window.storage.splice(i,1);
      --i;
    }
  }
  console.log(content);
  if(content != "empty"){
  console.log("drinn");
    
    //add new ellement to storage
    window.storage.push({lx:lx, ly:ly, rx:rx, ry: ry})
    
    const container = document.getElementById("container");
    let cell = document.createElement("div");
    cell.classList.add("grid-item");
    cell.classList.add("item" + lx + "-" + ly);

    spancol= ""
    if(rx-lx+1 > 1){
      spancol = " / span " + (rx-lx+1);
      
    }
    
    spanrow= ""
    if(ry-ly+1 > 1){
      spanrow = " / span " + (ry-ly+1);
    }
    
    jQuery.cssNumber.gridColumnStart = true;
    jQuery.cssNumber.gridColumnEnd = true;
    jQuery.cssNumber.gridRowStart = true;
    jQuery.cssNumber.gridRowEnd = true;
    
    $(cell).css({"grid-column": (lx+1) + spancol,  "grid-row": ly+1 + spanrow});
    
    container.appendChild(cell);
    //Create new element with width, heigth and content
    //$(".item" + lx + "-" + ly).css({"display": "block", "border-style": "solid", "border-color": "blue", "grid-column": (lx+1) + " / span " + (rx-lx+1),  "grid-row": ly+1 + " / span " + (ry-ly+1)});
    
    if(content != null && content != ""){
    
      var fullurl = content;
      //encode default parameter in URL
      if(defaultpara != "{}"){
        var fullurl = fullurl + "?";
        for (var key in defaultpara) {
          if (defaultpara.hasOwnProperty(key)) {
            fullurl = fullurl + key + "=" +  defaultpara[key] + "&";
           }
        }
      }
      
      
      
      fullurl = encodeURI(fullurl);
      $(".item" + lx + "-" + ly).html("<iframe width=100% height=100% name='" + id +"' id='" + id +"' src='" + fullurl + "' title='' frameBorder='0' ></iframe>");
              
      if(showbutton){
        $(".item" + lx + "-" + ly).append('<button class="formbutton" type="button" onclick="sendForm(\'' + '.item' + lx + '-' + ly +'\', \'' + encodeURIComponent(id) + '\', \'' + lx  + '\', \'' + ly  + '\')">' + showbutton + '</button>')
      }
      
      if(style){    
        $(".item" + lx + "-" + ly).find("iframe").on('load', function(){
          $(this).contents().find("head").append($("<link/>", 
            { rel: "stylesheet", href: style, type: "text/css" }
          ));
        });      
      }
      
      
      //hideRectangel(lx, ly, rx, ry)
    }
    else{
      $(".item" + lx + "-" + ly).html("No language available.<br> Nicht in der Sprache verfügbar.");
    }
  }
  
}

function sendForm(menuitem, cpeecallback,lx,ly){
  //Call iframe function that button has been pressed iframe should send json back
  //document.getElementById(decodeURIComponent(cpeecallback)).contentWindow.buttonPressed(cpeecallback);
  
  
  var formdata;
 if (typeof document.getElementById(decodeURIComponent(cpeecallback)).contentWindow.buttonPressed !== 'undefined' && $.isFunction(document.getElementById(decodeURIComponent(cpeecallback)).contentWindow.buttonPressed)) {
    var formdata = document.getElementById(decodeURIComponent(cpeecallback)).contentWindow.buttonPressed();
  }


  
  $.ajax({
    type: "PUT",
    url: decodeURIComponent(cpeecallback),
    contentType: "application/json",
    data: JSON.stringify(formdata),
    success: function (data) {
    }
  });
  
  
  
  
  //Its a design question if removing the frame should be done within centurio, do have more controll, or automatic within code?
  //close frame
  
  $(menuitem).remove();
  //remove frame from Server
  $.ajax({
    type: "Post",
    url: "",
		headers: {"content-id": "deleteframe"},
    data: {lx: lx, ly: ly},
    success: function (data) {      
    }
  });
  
}

function sendData(dataelement, datavalue){
  
  $.ajax({
    type: "Get",
    url: 'cpeeinstance.url',
    success: function(ret) {
      $.ajax({
        type: "Put",
        url: ret + "/properties/dataelements/" + dataelement,
        data: {value: datavalue},
        success: function (data) {     
          alert("Data Sent")
        }
      });
    }
  });
  
}

function sendCallback(callbackUrl, jsonToSend){
  
  $.ajax({
    type: "PUT",
    url: callbackUrl,
    contentType: "application/json",
    data: jsonToSend,
    success: function (data) {
      
    }
  });
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

function reloadAllFrames() {
  location.reload();
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
  init();
});

