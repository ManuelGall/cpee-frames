var cpee_message = new Event("cpee:message", {"bubbles":true, "cancelable":false});
var cpee = { data: null, callback: null};
window.addEventListener("message", (event) => {
  if (/(tum\.de|cpee\.org)$/.test(event.origin)) {
    cpee.data = event.data.data;
    cpee.callback = event.data.callback;
    document.dispatchEvent(cpee_message);
  }
});

function cpee_callback(callback,json) {
  $.ajax({
    type: "PUT",
    url: callback,
    contentType: "application/json",
    data: json
  });
}
