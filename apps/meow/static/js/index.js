// This will be the object that will contain the Vue attributes
// and be used to initialize it.

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init() {

    var self = {};
    
    // This is the Vue data.
    self.data = {
        // Complete as you see fit.
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
    
    // Sets the restaurant id and items that the restaurant has.
    // This will be helpful in displaying the items and getting any information
    // that the restaurant may have.
    self.display_menu = function(restaurant) {
        self.restaurant_id = restaurant.id
        axios.get(get_items_url, {params: {restaurant_id: self.restaurant_id}}).then( function (response) {
            self.items = self.enumerate(response.data.items);
        });
    };

    // This contains all the methods.
    self.methods = {
        // Complete as you see fit.
        display_menu: self.display_menu
    };

    // This creates the Vue instance.
    self.vue = new Vue({
        el: "#vue-target",
        data: self.data,
        methods: self.methods
    });

    // Put here any initialization code
    axios.get(get_restaurants_url).then(function(r) {
        self.vue.restaurants = self.enumerate(r.data.restaurants);
    });

    return self;
};


// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
window.app = init();
