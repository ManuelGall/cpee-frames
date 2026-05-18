var cpee = { data: null, callback: null};
window.addEventListener("message", (event) => {
  if (/(tum\.de|cpee\.org)$/.test(event.origin)) {
    cpee.data = event.data.data;
    cpee.callback = event.data.callback;
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
