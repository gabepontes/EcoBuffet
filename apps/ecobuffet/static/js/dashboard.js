// List of users, items, and customization page
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        users: [], 
        user_likes: [],
        orders: [], 
        light_mode: localStorage.getItem('light_mode') == 'true',
        restaurant_name: "",
        restaurant_description: "",
        restaurant_id: null,
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
                self.data.orders = response.data.items;
            });
    };
    /*
    self.get_user_likes = function(restaurant_id) {
        self.data.restaurant_id = restaurant_id;
        axios.get(get_user_likes_url, {params:{restaurant_id: self.data.restaurant_id}}).then(function (response) {
            self.data.user_likes = response.data.user_likes;
        });
    }
    */
    self.get_restaurant_name = function(restaurant_id) {
        self.data.restaurant_id = restaurant_id;
        console.log(self.data.restaurant_id)
        axios.get(get_restaurant_name_url).then(function (response) {
            self.data.restaurant_name = response.data.restaurant_name;
            console.log(self.data.restaurant_name)
        });
    }
    self.modify_restaurant_description = function(restaurant_id) {
        self.data.restaurant_id = Number(restaurant_id);
        axios.post(modify_restaurant_description_url, {restaurant_id: self.data.restaurant_id, restaurant_description: self.data.restaurant_description})
            .then(function (response) {
                self.data.restaurant_description = response.data.description;
            });
    }
    self.modify_restaurant_name = function(restaurant_id) {
        self.data.restaurant_id = Number(restaurant_id);
        axios.post(modify_restaurant_name_url, {restaurant_id: self.data.restaurant_id, restaurant_name: self.data.restaurant_name})
            .then(function (response) {
                self.data.restaurant_name = response.data.name;
            });
    }
    // This contains all the methods.
    self.methods = {
        toggle_light_mode: self.toggle_light_mode,
        modify_restaurant_name: self.modify_restaurant_name,
        modify_restaurant_description: self.modify_restaurant_description
    };

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
    self.get_restaurant_name();
//    self.get_user_likes();
    //self.fetch_orders();

    self.page_load();
    
    return self;
};

window.app = init();
