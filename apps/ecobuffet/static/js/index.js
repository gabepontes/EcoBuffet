// List of restaurants page
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        light_mode: localStorage.getItem('light_mode') !== 'false',  // Load the light mode state from local storage
        restaurants: []
    };

    self.fetch_restaurants = function() {
        axios.get(get_restaurants_url)
            .then(function(response) {
                self.data.restaurants = response.data.restaurants;
            });
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
            boxes.item(i).classList.toggle("has-text-light");
         }
    }

    // This contains all the methods.
    self.methods = {
        toggle_light_mode: self.toggle_light_mode
    };

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods
    });

    // Fetch restaurants when the page loads
    self.fetch_restaurants();

    return self;
};

window.app = init();
