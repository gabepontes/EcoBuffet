// List of users, items, and customization page
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        users: [], orders: [], light_mode: localStorage.getItem('light_mode') == 'true'
    };

    self.toggle_light_mode = function() {
        if (self.vue.light_mode == true) {
            self.vue.light_mode = false;
            localStorage.setItem('light_mode', 'false');  // Store the light mode state in local storage
        } else {
            self.vue.light_mode = true;
            localStorage.setItem('light_mode', 'true');  // Store the light mode state in local storage
        }
        let main = document.body;
        main.classList.toggle("has-background-dark");
        main.classList.toggle("has-text-light");

        let boxes = document.getElementsByClassName("box");
        for (var i = 0; i < boxes.length; i++) {
            boxes.item(i).classList.toggle("has-background-dark");
         }
    }

    self.page_load = function() {
        if (localStorage.getItem('light_mode') == 'false') {
            let main = document.body;
            main.classList.toggle("has-background-dark");
            main.classList.toggle("has-text-light");

            let boxes = document.getElementsByClassName("box");
            for (var i = 0; i < boxes.length; i++) {
                console.log('box')
                boxes.item(i).classList.toggle("has-background-dark");
            }
        }
    }

    self.fetch_users = function() {
        axios.get(get_users_url)
            .then(function(response) {
                self.data.users = response.data.users;
            });
    };    

    self.fetch_orders = function() {
        axios.get(get_items_url)
            .then(function(response) {
                self.data.orders = response.data.orders;
            });
    };

    // This contains all the methods.
    self.methods = {toggle_light_mode: self.toggle_light_mode};

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods
    });

    if (localStorage.getItem('light_mode') == null) {
        localStorage.setItem('light_mode', 'true');
        self.light_mode = true;
    } else {
        if (localStorage.getItem('light_mode') == 'true') {
            self.light_mode = true;
        } else {
            self.light_mode = false;
            
        }
    }

    // Fetch restaurants when the page loads
    self.fetch_users();
    self.page_load();
    //self.fetch_orders();

    return self;
};

window.app = init();
