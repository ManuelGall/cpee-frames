

function removeElementsByClass(className){
   alert(className)
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}


function makeFrame(col, row, colamount = 1, rowamount = 1) {
  
  var style = document.createElement('style');
  style.innerHTML = "   .item" + col + "-" + row + " {          border-style: solid;          border-color: blue;          grid-column: " + col + " / span " + colamount + ";         grid-row: "+ row + " / span " + rowamount + ";        }          ";
  document.head.appendChild(style);
  
  var k = 1;
  for(var i = 1; i < colamount || k < rowamount; ++i){
    removeElementsByClass("item" + (col + i) + "-" + (row + k -1))
    
    if(i == colamount && k < rowamount){
      i = 0;
      ++k;
    }
  }
  
  
};


document.addEventListener('keyup', (event) => {
    if (event.key == 'ArrowUp') {
        alert("ArrowUp");
        makeFrame(1,1,2,1)
    }
    if (event.key == 'ArrowDown') {
        alert("ArrowDown");
        
        makeFrame(2,1,1,2)
    }
});
  
  