

document.addEventListener('keyup', (event) => {
  if (event.key == 'ArrowRight') {
    $.ajax({
      type: "PUT",
      url: "../Manuel",
      headers: {"content-id": "input"},
      data: { style_url: "mystyleURL", document_url: 'www.nixdrin.at' },
      success: function(res) {
        location.reload();
      },
      error: function (request, status, error) {
        alert(request.responseText + status + error);
      }
    });
  }
  
    if (event.key == 'ArrowUp') {

      $.ajax({
        type: "POST",
        url: "../Manuel",
        headers: {"content-id": "frame"},
        data: { lx: "2", ly: '0', rx: '1', ry: '2', url: 'https://centurio.work/' },
        success: function(res) {
          location.reload();
        },
        error: function (request, status, error) {
          alert(request.responseText + status + error);
        }
      });
    }
    
    
    if (event.key == 'ArrowDown') {
      $.ajax({
        type: "POST",
        url: "../Manuel",
        headers: {"content-id": "frame"},
        data: { lx: "0", ly: '0', rx: '2', ry: '2', url: 'https://centurio.work/flow-test/' },
        success: function(res) {
          location.reload();
        },
        error: function (request, status, error) {
          alert(request.responseText + status + error);
        }
      });
    }
    
    if (event.key == 'ArrowLeft') {
      $.ajax({
        type: "POST",
        url: "../Manuel",
        headers: {"content-id": "frame"},
        data: { lx: "1", ly: '1', rx: '2', ry: '2', url: 'https://centurio.work/customers/evva/was/ui/' },
        success: function(res) {
          location.reload();
        },
        error: function (request, status, error) {
          alert(request.responseText + status + error);
        }
      });
    }
  
    
});
   