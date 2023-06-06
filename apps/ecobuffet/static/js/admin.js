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
                    image: null, 
                },
                selectedItemId: null,
                selectedItemName: null,
                selectedItemDescription: null, 
                selectedItemImage: null, 
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
            
            
            handleFileUpload(){
                this.newItem.image = this.$refs.file.files[0];
            },

            handleEditFileUpload(){ 
                this.selectedItemImage = this.$refs.editFile.files[0];
            },

            addItem: function() {
                const formData = new FormData();
                formData.append('name', this.newItem.name);
                formData.append('description', this.newItem.description);
                formData.append('image', this.newItem.image);

                axios.post(`/ecobuffet/add_items/${this.restaurant_id}/admin`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then((response) => {
                    this.getItems();  
                    this.newItem.name = '';
                    this.newItem.description = '';
                    this.newItem.image = null;
                });
            },
            populateItemDetails: function() {
                const selectedItem = this.items.find(item => item.id === this.selectedItemId);
                this.selectedItemName = selectedItem.name;
                this.selectedItemDescription = selectedItem.description; 
                this.selectedItemImage = null; 
            },

            editItem: function() {
                if (this.selectedItemId) {
                    const selectedItem = this.items.find(item => item.id === this.selectedItemId);
                    const formData = new FormData(); 
                    formData.append('name', this.selectedItemName);
                    formData.append('description', this.selectedItemDescription);
                    if (this.selectedItemImage) {
                        formData.append('image', this.selectedItemImage);
                    }
                    axios.post(`/ecobuffet/edit_items/${this.restaurant_id}/${this.selectedItemId}/admin`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data' 
                        }
                    })
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
