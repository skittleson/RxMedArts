JSONEditor.defaults.options.theme = "bootstrap3";
JSONEditor.defaults.options.disable_collapse = true;
JSONEditor.defaults.options.disable_edit_json = true;
JSONEditor.defaults.options.disable_properties = true;

function putMessage(requestModel, endpoint) {
  var ts = Math.round(new Date().getTime() / 1000);
  return fetch(endpoint + "/" + ts, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestModel)
  });
}
