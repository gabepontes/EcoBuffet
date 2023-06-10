# Development Documentation
EcoBuffet is developed in the following format with py4web + vue.js + Bulma.
Each page should have the following.
- page.html
- page.js
- controllers.py::page

Where the page.html will indicate how the page is formatted, the page.js will feed the html file
with the necessary client-side reactivity and info and query the server for anything.

The html file will hold URLs given by the controllers.py::page function that will provide server-side
functionality to get information from the database. Therefore, the controllers.py::page function should
provide signed URLs to allow vue.js to interact with the database.