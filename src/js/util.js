JSONEditor.defaults.options.theme = "bootstrap3";
JSONEditor.defaults.iconlib = 'fontawesome4';
JSONEditor.defaults.options.disable_collapse = true;
JSONEditor.defaults.options.disable_edit_json = true;
JSONEditor.defaults.options.disable_properties = true;
JSONEditor.defaults.options.disable_array_delete_all_rows = true;
JSONEditor.defaults.options.prompt_before_delete = false;


function postMessage(requestModel, endpoint) {
  return fetch(endpoint + "/form", {
    method: "POST",
    mode: "no-cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestModel)
  });
}

function initEditorFormRequest(
  editor,
  btnElementId,
  editorElementId,
  thankYouElementId,
  spinnerElementId,
  endpoint,
  formName,
  siteKey
) {
  window.gToken = "";
  grecaptcha.ready(function() {
    grecaptcha.execute(siteKey, { action: formName }).then(
      function(token) {
        window.gToken = token;
      },
      function(error) {
        console.log(error);
      }
    );
  });
  editor.on("change", function() {
    editor.validate();
  });
  document.querySelector(btnElementId).addEventListener("click", function() {
    var errors = editor.validate();
    if (errors.length) {
      alert("There was an error with the form. All fields are required.");
    } else {
      editor.disable();
      document.querySelector(btnElementId).disable = true;
      document.querySelector(editorElementId).style.display = "none";
      document.querySelector(spinnerElementId).style.display = "block";
      var form = editor.getValue();
      form.form = formName;
      form.clientSubmissionDate = Date.now();
      form.token = window.gToken;
      postMessage(form, endpoint)
        .then(function() {
          document.querySelector(thankYouElementId).style.display = "block";
          editor.destroy();
        })
        .catch(function(error) {
          editor.enable();
          document.querySelector(editorElementId).style.display = "block";
          alert(
            "There was an error submitting this form. Please call us instead. " +
              error
          );
        })
        .finally(function() {
          document.querySelector(spinnerElementId).style.display = "none";
          document.querySelector(btnElementId).disable = false;
        });
    }
  });
}
