

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

function clearRectangel(l1x, l1y, r1x, r1y){
  for(var i = l1x; i <= r1x; ++i)
    for(var k = l1y; k <= r1y; ++k){
      $(".item" + (i) + "-" + (k)).css({"display": "block", "border-style": "none", "border-color": "black", "grid-area": "auto"});
      $(".item" + (i) + "-" + (k)).text("");
    }
}

function hideRectangel(l1x, l1y, r1x, r1y){
  for(var i = l1x; i <= r1x; ++i)
    for(var k = l1y; k <= r1y; ++k)
      if(!(i == l1x && k == l1y))
        $(".item" + (i) + "-" + (k)).hide(100);
}



function makeFrame(lx, ly, rx, ry, content = "") {
  
  //check if rects overlap if they do remove old ones
  for (i = 0; i < window.storage.length; i++) {
    if(doOverlap(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry, lx, ly, rx, ry)){
      clearRectangel(window.storage[i].lx, window.storage[i].ly, window.storage[i].rx, window.storage[i].ry)
      window.storage.splice(i,1);
      --i;
    }
  }
  
  //add new ellement to storage
  window.storage.push({lx:lx, ly:ly, rx:rx, ry: ry})
  
  //Create new element with width, heigth and content
  $(".item" + lx + "-" + ly).css({"display": "block", "border-style": "solid", "border-color": "blue", "grid-column": (lx+1) + " / span " + (rx-lx+1),  "grid-row": ly+1 + " / span " + (ry-ly+1)});
  
  $(".item" + lx + "-" + ly).html("<iframe width=100% height=100% src='" + content + "' title=''></iframe>");
  hideRectangel(lx, ly, rx, ry)
};

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
  