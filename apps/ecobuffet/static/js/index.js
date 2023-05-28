// List of restaurants page
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        restaurants: []
    };

    self.fetch_restaurants = function() {
        axios.get(get_restaurants_url)
            .then(function(response) {
                self.data.restaurants = response.data.restaurants;
            });
    };

    // This contains all the methods.
    self.methods = {};

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
