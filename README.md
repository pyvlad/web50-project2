# Project 2

## Web Programming with Python and JavaScript

My implementation of **Study Project 2: Flack**:
a basic attempt at building an online messaging service using Flask and socket.io.

<br>
### Short description:
Everything happens on a single page at '/':

1. a user is asked to enter username which is stored on client in localStorage for future use;
2. when the username is available, the user sees a greeting and the list of current channels,
new channels are being added to the list interactively;
3. the user can create channels via form on the left,
to join an available channel the user needs to click on the channel name;
4. to leave a channel, the user can:
    - click on another channel (and thus join it),
    - click second time on current channel (and not be in any channel),
    - close the browser (last active channel will be loaded next time).

<br>
### Project files include:
The server-side of the application is implemented in app.py.

The client-side is implemented in static/channels.js and static/style.css.

The base template is at templates/base.html, the template of the only page of the application
is at templates/channels.html. The template hierarchy is not needed because there is only one page,
but I've kept it to keep the application extensible.
