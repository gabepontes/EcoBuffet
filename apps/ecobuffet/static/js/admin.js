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
                selectedItemId: null,
                selectedItemName: null,
            }
        },
        
        mounted: function() {
            this.restaurant_id = Number(this.$el.dataset.restaurantId);
            if (isNaN(this.restaurant_id)) {
                console.error("Invalid restaurant_id: ", this.restaurant_id);
                return;
            }
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
                axios.post(`/ecobuffet/add_items/${this.restaurant_id}/admin`, postData)
                    .then((response) => {
                        this.getItems();  
                        this.newItem.name = '';
                        this.newItem.description = '';
                    });
            },
            editItem: function() {
                if (this.selectedItemId) {
                    const selectedItem = this.items.find(item => item.id === this.selectedItemId);
                    const postData = {
                        id: selectedItem.id,
                        name: this.selectedItemName,
                        description: selectedItem.description,
                        restaurant_id: this.restaurant_id,
                    };
                    axios.post(`/ecobuffet/edit_items/${this.restaurant_id}/${this.selectedItemId}/admin`, postData)
                        .then((response) => {
                            this.getItems();
                        });
                }
            },
            removeItem: function() {
                if (this.selectedItemId) {
                    const selectedItem = this.items.find(item => item.id === this.selectedItemId);
                    const postData = {
                        id: selectedItem.id,
                        restaurant_id: this.restaurant_id,
                    };
                    axios.post(`/ecobuffet/remove_items/${this.restaurant_id}/${this.selectedItemId}/admin`, postData)
                        .then((response) => {
                            this.getItems();
                        });
                }
            },
        },
        watch: {
            tab: function(newVal, oldVal) {
                if (newVal === 'edit' || newVal === 'remove') {
                    this.getItems();
                }
            }
        },
        created: function() {
            this.getRestaurants();
            this.getItems();
        }
    });
});
