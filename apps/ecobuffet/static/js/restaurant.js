// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        light_mode: localStorage.getItem("light_mode") === "true" || true,
        restaurants: [],
        items: [],
        formatted_items: [],
        restaurant_id: null,
        restaurant_name: null
    };


    self.enumerate = function (a) {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    self.get_restaurant_name = function(restaurant_id) {
        self.data.restaurant_id = restaurant_id;
        axios.get(get_restaurant_name_url, {params: {restaurant_id: self.data.restaurant_id}}).then(function (response) {
            self.data.restaurant_name = response.data.restaurant_name;
        });
    }
    
    self.display_menu = function(restaurant_id) {
        self.data.restaurant_id = restaurant_id;
        axios.get(get_items_url, {params: {restaurant_id: self.data.restaurant_id}}).then(function (response) {
            self.data.items = self.enumerate(response.data.items);
            self.get_formatted_items();
        });
    };

    self.like_item = function(item_idx) {
        // Perform liking the item
        item = self.data.items[item_idx]
        axios.post(like_item_url, {item_id: item.id})
            .then(function(response) {
                // Update the likes for this item in the data array
                var likedItem = self.data.items[item_idx];
                likedItem.likes = response.data.likes;
            });
    };

    self.dislike_item = function(item_idx) {
        // Perform disliking the item
        item = self.data.items[item_idx]
        axios.post(dislike_item_url, {item_id: item.id})
            .then(function(response) {
                // Update the dislikes for this item in the data array
                var dislikedItem = self.data.items[item_idx];
                dislikedItem.dislikes = response.data.dislikes;
            });
    };

    self.get_formatted_items = function() {
        // Get arrays of COLUMN_SIZE to iterate over. We want the array to look like
        // [[1, 2, 3], [1, 4, 5], [7, 8]] so it can be displayed like...
        // ---------
        // [1, 2, 3]
        // [1, 4, 5]
        // [7, 8, null]
        // ---------
        // for a column size of 3
        COLUMN_SIZE = 4;
        column_tracker = 0;
        let arr = [];
        for (idx in self.data.items) {
            arr.push(idx);
            column_tracker += 1;
            if (column_tracker % COLUMN_SIZE == 0) {
                self.data.formatted_items.push(arr);
                arr = [];
            }
            // Enter in the last array if it matches the last index.
            // Fill the remainder of the array with null values so
            // we can create placeholder tiles to look nice :).
            else if (idx == self.data.items.length - 1) {
                console.log("Entering in remaining items!")
                while (arr.length != COLUMN_SIZE) {
                    arr.push(null);
                }
                self.data.formatted_items.push(arr);
            }
        }
        console.log(self.data.formatted_items)
    }

    self.toggle_light_mode = function() {
        if (self.vue.light_mode == true) {
            self.vue.light_mode = false;
            localStorage.setItem("light_mode", false);
        } else {
            self.vue.light_mode = true;
            localStorage.setItem("light_mode", true);
        }
    
        let main = document.body;
        main.classList.toggle("has-background-dark");
        main.classList.toggle("has-text-light");
    
        let boxes = document.getElementsByClassName("box");
        for (var i = 0; i < boxes.length; i++) {
            boxes.item(i).classList.toggle("has-background-dark");
            boxes.item(i).classList.toggle("has-text-light");
        }

        // Toggle color for 'Return to Main Menu' button
        let returnButton = document.getElementsByClassName("return-button");
        for (var i = 0; i < returnButton.length; i++) {
            returnButton.item(i).classList.toggle("has-text-light");
        }

        // Toggle color for restaurant name
        let restaurantName = document.getElementsByClassName("restaurant-name");
        for (var i = 0; i < restaurantName.length; i++) {
            restaurantName.item(i).classList.toggle("has-text-light");
        }

        // Toggle color for menu items
        let menuItems = document.getElementsByClassName("menu-item");
        for (var i = 0; i < menuItems.length; i++) {
            menuItems.item(i).classList.toggle("has-text-light");
        }
    }

    // This contains all the methods.
    self.methods = {
        display_menu: self.display_menu,
        like_item: self.like_item,
        dislike_item: self.dislike_item,
        toggle_light_mode: self.toggle_light_mode
    };

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods,
        created() {
            if (this.light_mode === false) this.toggle_light_mode();
        }
    });

    // Put here any initialization code
    // such as getting data from server
    axios.get(get_restaurants_url).then(function(response) {
        self.vue.restaurants = self.enumerate(response.data.restaurants);
        console.log("Starting Restaurant App!");
    });

    self.get_restaurant_name();
    self.display_menu();

    return self;
};

window.app = init();