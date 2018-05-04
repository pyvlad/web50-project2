document.addEventListener('DOMContentLoaded', () => {

    var username = localStorage.getItem('username');
    var target = document.querySelector('#greeting');
    var form = document.querySelector('#form');
    var form_username = document.querySelector('#username');
    var form_submit = document.querySelector('#submit');

    function show_greeting() {
      target.innerHTML = `Hello, ${username}!`;
      target.style.display = "block";
    }

    // If there is username, show greeting and don't show form
    if (username) {
      show_greeting();
    }
    // Else provide a form to enter username
    else {
      // By default, submit button is disabled
      form_submit.disabled = true;

      // Enable button only if there is text in the username field
      form_username.onkeyup = () => {
        form_submit.disabled = ((form_username.value.length > 0) ? false : true)
      };

      // Define callback for form submit
      form.onsubmit = () => {
        username = document.querySelector("#username").value;
        localStorage.setItem('username', username);
        form.style.display = "none";
        show_greeting();
        return false;
      }

      // Show form
      form.style.display = "block";
    };
});
