// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init() {
    var self = {};

    // This is the Vue data.
    self.data = {
        restaurants: [],
        items: [],
        restaurant_id: null
    };

    self.enumerate = function (a) {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    
    self.display_menu = function(restaurant) {
        self.data.restaurant_id = restaurant.id;
        axios.get(get_items_url, {params: {restaurant_id: self.data.restaurant_id}}).then(function (response) {
            self.data.items = self.enumerate(response.data.items);
        });
    };

    self.like_item = function(item) {
        // Perform liking the item
        axios.post(like_item_url, {item_id: item.id})
            .then(function(response) {
                // Update the likes for this item in the data array
                var likedItem = self.data.items.find(i => i.id === item.id);
                if (likedItem) likedItem.likes = response.data.likes;
            });
    };

    self.dislike_item = function(item) {
        // Perform disliking the item
        axios.post(dislike_item_url, {item_id: item.id})
            .then(function(response) {
                // Update the dislikes for this item in the data array
                var dislikedItem = self.data.items.find(i => i.id === item.id);
                if (dislikedItem) dislikedItem.dislikes = response.data.dislikes;
            });
    };

    // This contains all the methods.
    self.methods = {
        display_menu: self.display_menu,
        like_item: self.like_item,
        dislike_item: self.dislike_item
    };

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods
    });

    // Put here any initialization code
    // such as getting data from server
    axios.get(get_restaurants_url).then(function(response) {
        self.vue.restaurants = self.enumerate(response.data.restaurants);
    });

    return self;
};

window.app = init();
