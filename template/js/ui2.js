

var storage = []; //{col:1, row:1, colamount:1, rowamount: 1}];


function doOverlap(l1x, l1y, r1x, r1y, l2x, l2y, r2x, r2y) 
{ 
    // If one rectangle is on left side of other 
    if (l1x > r2x || l2x > r1x) 
        return false;
    // If one rectangle is above other 
    if (l1y > r2y || l2y > r1y) 
        return false;
    return true; 
}
/*
function clearRectangel(l1x, l1y, r1x, r1y){
  for(var i = l1x; i <= r1x; ++i)
    for(var k = l1y; k <= r1y; ++k){
      $(".item" + (i) + "-" + (k)).remove();
      //$(".item" + (i) + "-" + (k)).css({"display": "block", "border-style": "none", "border-color": "black", "grid-area": "auto"});
      //$(".item" + (i) + "-" + (k)).text("");
    }
}

function hideRectangel(l1x, l1y, r1x, r1y){
  for(var i = l1x; i <= r1x; ++i)
    for(var k = l1y; k <= r1y; ++k)
      if(!(i == l1x && k == l1y))
        $(".item" + (i) + "-" + (k)).hide(100);
}
*/


function makeFrame(lx, ly, rx, ry, content = "", id = "", showbutton=false) {
  
  //check if rects overlap if they do remove old ones
  for (i = 0; i < window.storage.length; i++) {
    if(doOverlap(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry, lx, ly, rx, ry)){
      $(".item" + window.storage[i].lx + "-" + window.storage[i].ly).remove();
      //clearRectangel(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry)
      window.storage.splice(i,1);
      --i;
    }
  }
  
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
  
  $(cell).css({"display": "block", "border-style": "solid", "border-color": "blue", "grid-column": (lx+1) + spancol,  "grid-row": ly+1 + spanrow});
  
  console.log({"display": "block", "border-style": "solid", "border-color": "blue", "grid-column-start": (lx+1), "grid-column-end": (rx+1),  "grid-row-start": ly+1,  "grid-row-end": ry+1})
  
  container.appendChild(cell);
    
  //Create new element with width, heigth and content
  //$(".item" + lx + "-" + ly).css({"display": "block", "border-style": "solid", "border-color": "blue", "grid-column": (lx+1) + " / span " + (rx-lx+1),  "grid-row": ly+1 + " / span " + (ry-ly+1)});
  
  if(content != null && content != ""){
    $(".item" + lx + "-" + ly).html("<iframe width=100% height=100% name='" + id +"' src='" + content + "' title=''></iframe>");
            
    if(showbutton && content.startsWith("https://centurio.work/out/forms")){
      $(".item" + lx + "-" + ly).append('<button class="formbutton" type="button" onclick="sendForm(\'' + '.item' + lx + '-' + ly +'\', \'' + encodeURIComponent(id) + '\', \'' + lx  + '\', \'' + ly  + '\')">Send Form</button>')    
    }
    
    //hideRectangel(lx, ly, rx, ry)
  }
  else{
    $(".item" + lx + "-" + ly).html("No language available.<br> Nicht in der Sprache verfügbar.");
    //hideRectangel(lx, ly, rx, ry)
  }
  
};

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}



function sendForm(menuitem, cpeecallback,lx,ly){
  /* old can be used when formi js is active */
  $.ajax({
    type: "PUT",
    url: decodeURIComponent(cpeecallback),
    contentType: "application/json",
    data: $('iframe[name="' + decodeURIComponent(cpeecallback) +  '"]').contents().find("#submission").html(),
    success: function (data) {
      //close form
      $(menuitem).remove();
    }
  });
  
  
  //get Iframe then data
  /* without formio JS
  var $form = $('iframe[name="' + decodeURIComponent(cpeecallback) +  '"]').contents().find("#form");
  var formdatajson = getFormData($form);
  alert(JSON.stringify(formdatajson))

  $.ajax({
    type: "PUT",
    url: decodeURIComponent(cpeecallback),
    contentType: "application/json",
    data: JSON.stringify(formdatajson),
    success: function (data) {
      //close form
      $(menuitem).remove();
    }
  });
  */
  
  //remove from Server
  $.ajax({
    type: "Post",
    url: "",
		headers: {"content-id": "deleteframe"},
    data: {lx: lx, ly: ly},
    success: function (data) {      
    }
  });
}




/*
document.addEventListener('keyup', (event) => {
    if (event.key == 'ArrowUp') {
        alert("ArrowUp");
        makeFrame(0,0,0,0, "a")
    }
    if (event.key == 'ArrowDown') {
        alert("ArrowDown");
        
        makeFrame(0,0,1,1, "b")
    }
    if (event.key == 'ArrowLeft') {
        alert("ArrowLeft");
        
        makeFrame(1,1,2,2, "c")
    }
    
    if (event.key == 'ArrowRight') {
        alert(JSON.stringify(window.storage));
    }
});
*/
  