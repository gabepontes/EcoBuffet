// List of users, items, and customization page
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        users: [], orders: []
    };

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
    self.methods = {};

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods
    });

    // Fetch restaurants when the page loads
    self.fetch_users();
    //self.fetch_orders();

    return self;
};

window.app = init();
