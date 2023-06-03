document.addEventListener('DOMContentLoaded', (event) => {
    var app = new Vue({
        el: '#vue-target',
        data: function() {
            return {
                restaurant_id: null,  
                restaurants: [],
                items: [],
                tab: 'add', 
                newItem: {
                    name: '',
                    description: '',
                },
                selectedItem: null,
            }
        },
        mounted: function() {
            this.restaurant_id = Number(this.$el.dataset.restaurantId);
        },
        methods: {
            getRestaurants: function() {
                axios.get(getRestaurantsUrl)
                    .then((response) => {
                        this.restaurants = response.data;
                    });
            },
            getItems: function() {
                axios.get(getItemsUrl + "?restaurant_id=" + this.restaurant_id)
                    .then((response) => {
                        this.items = response.data.items;
                    });
            },
            addItem: function() {
                const postData = {
                    name: this.newItem.name,
                    description: this.newItem.description,
                };
                axios.post(addItemsUrl + "?restaurant_id=" + this.restaurant_id, postData)
                    .then((response) => {
                        this.getItems();  
                        this.newItem.name = '';
                        this.newItem.description = '';
                    });
            },
            editItem: function() {
                if (this.selectedItem) {
                    const postData = {
                        id: this.selectedItem.id,
                        name: this.selectedItem.name,
                        description: this.selectedItem.description,
                        restaurant_id: this.restaurant_id,
                    };
                    axios.post(editItemsUrl, postData)
                        .then((response) => {
                            this.getItems();
                        });
                }
            },
            removeItem: function() {
                if (this.selectedItem) {
                    const postData = {
                        id: this.selectedItem.id,
                        restaurant_id: this.restaurant_id,
                    };
                    axios.post(removeItemsUrl, postData)
                        .then((response) => {
                            this.getItems();
                        });
                }
            },
        },
        created: function() {
            this.getRestaurants();
            this.getItems();
        }
    });
});
