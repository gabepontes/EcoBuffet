// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        light_mode: localStorage.getItem("light_mode") == "true",
        restaurants: [],
        items: [],
        formatted_items: [],
        restaurant_id: null,
        restaurant_name: null,
        user_likes: []
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

    self.get_user_likes = function(restaurant_id) {
        self.data.restaurant_id = restaurant_id;
        axios.get(get_user_likes_url, {params: {restaurant_id: self.data.restaurant_id}}).then(function (response) {
            self.data.user_likes = response.data.user_likes;
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
        item = self.data.items[item_idx];
        let del = false;
        let action = true;
        if (self.data.user_likes.some(obj => obj.item_name == item.name)) {
            //console.log("found item")
            for (let i = 0; i < self.data.user_likes.length; i++) {
                // If item is disliked, don't do anything else delete the like
                let like_item = self.data.user_likes[i]
                if (like_item.item_name == item.name && like_item.like == "False") {
                    //console.log("not doing anything")
                    action = false;
                    break;
                }
            } 
            if (action == true) {
                //console.log("deleting")
                    del = true;
            }
        }
        if (action == true) {
            axios.post(like_item_url, { item_id: item.id, del: del })
                .then(function (response) {
                    // Update the likes for this item in the data array
                    var likedItem = self.data.items[item_idx];
                    likedItem.likes = response.data.likes;
                    self.get_user_likes();
                });
        }
    };

    self.dislike_item = function(item_idx) {
        // Perform disliking the item
        item = self.data.items[item_idx]
        let del = false;
        let action = true;
        if (self.data.user_likes.some(obj => obj.item_name == item.name)) {
            //console.log("found item")
            for (let i = 0; i < self.data.user_likes.length; i++) {
                let like_item = self.data.user_likes[i]
                // If item is liked, don't do anything else delete the dislike
                if (like_item.item_name == item.name && like_item.like == "True") {
                    //console.log("not doing anything")
                    action = false;
                    break;
                }
            } 
            if (action == true) {
                //console.log("deleting")
                del = true;
            }
        }
        if (action == true) {
            axios.post(dislike_item_url, { item_id: item.id, del: del })
                .then(function (response) {
                    // Update the dislikes for this item in the data array
                    var dislikedItem = self.data.items[item_idx];
                    dislikedItem.dislikes = response.data.dislikes;
                    self.get_user_likes();
                });
        }
        
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
    
        // Toggle text color for restaurant title and menu items
        let titles = document.getElementsByClassName("restaurant-title");
        for (var i = 0; i < titles.length; i++) {
            titles.item(i).classList.toggle("has-text-light");
        }
        let restaurantName = document.getElementsByClassName("restaurant-name");
        for (var i = 0; i < restaurantName.length; i++) {
            restaurantName.item(i).classList.toggle("has-text-light");
        }
        // Here's the new piece for menu items
        let menuItems = document.getElementsByClassName("menu-item");
        for (var i = 0; i < menuItems.length; i++) {
            menuItems.item(i).classList.toggle("has-text-light");
        }
    }

    self.is_liked = function(item_idx) {
        // Check if the user has liked the item
        item = self.data.items[item_idx];
        return self.data.user_likes.some(like_item => like_item.item_name === item.name && like_item.like == "True");
    };
    
    self.is_disliked = function(item_idx) {
        // Check if the user has disliked the item
        item = self.data.items[item_idx];
        return self.data.user_likes.some(like_item => like_item.item_name === item.name && like_item.like == "False");
    };
    
    self.page_load = function() {
        if (localStorage.getItem('light_mode') == 'false') {
            let main = document.body;
            main.classList.add("has-background-dark");
            main.classList.add("has-text-light");

            let boxes = document.getElementsByClassName("box");
            for (var i = 0; i < boxes.length; i++) {
                boxes.item(i).classList.add("has-background-dark");
                boxes.item(i).classList.add("has-text-light");
            }

            // Toggle text color for restaurant title and menu items
            let titles = document.getElementsByClassName("restaurant-title");
            for (var i = 0; i < titles.length; i++) {
                // console.log("titles")
                titles.item(i).classList.add("has-text-light");
            }
            let restaurantName = document.getElementsByClassName("restaurant-name");
            for (var i = 0; i < restaurantName.length; i++) {
                // console.log("restaurant")
                restaurantName.item(i).classList.add("has-text-light");
            }
            // Here's the new piece for menu items
            let menuItems = document.getElementsByClassName("menu-item");
            for (var i = 0; i < menuItems.length; i++) {
                // console.log("menu")
                menuItems.item(i).classList.add("has-text-light");
            }
        }
    }

    // This contains all the methods.
    self.methods = {
        display_menu: self.display_menu,
        like_item: self.like_item,
        dislike_item: self.dislike_item,
        toggle_light_mode: self.toggle_light_mode,
        is_liked: self.is_liked,
        is_disliked: self.is_disliked
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
    self.get_user_likes();
    self.display_menu();

    self.page_load();

    return self;
};

window.app = init();