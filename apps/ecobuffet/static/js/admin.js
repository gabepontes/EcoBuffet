document.addEventListener('DOMContentLoaded', (event) => {
    var app = new Vue({
        el: '#vue-target',
        data: function() {
            return {
                restaurant_id: null,  
                restaurants: [],
                items: [],
                tab: 'seven', 
                light_mode: localStorage.getItem("light_mode") == "false",
                newItem: {
                    name: '',
                    description: '',
                    image: null, 
                },
                selectedItemId: null,
                selectedItemName: null,
                selectedItemDescription: null, 
                selectedItemImage: null, 
                search_text: "",
                users: [],
                set_search: false,
                authenticated_users: []
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

            toggle_set_search: function() {
                this.set_search = !this.set_search;
            },

            search: function() {
                // We search based on the query being set by the search box.
                if (app.search_text.length > 0) {
                    axios.get(search_url, {params: {query: app.search_text}})
                    .then(function (result) {
                        app.users = result.data.results;
                        console.log("Got search results!")
                    })
                }
                else {
                    app.users = []
                    console.log("Cleared available users!")
                }
            },

            add_authorized_user: function(user) {
                axios.get(add_authorized_user_url, {params: {user: user.id, restaurant_id: this.restaurant_id}})
                    .then((response) => {
                        app.authenticated_users = response.data.authorized_users;
                        app.get_authorized_users();
                    });
            },
            
            delete_authorized_user: function(user) {
                axios.get(delete_authorized_user_url, {params: {user: user.id, restaurant_id: this.restaurant_id}})
                    .then((response) => {
                        app.authenticated_users = response.data.authorized_users;
                        app.get_authorized_users();
                    });
            },

            get_authorized_users: function() {
                console.log(this.restaurant_id)
                axios.get(get_authorized_users_url, {params: {restaurant_id: this.restaurant_id}})
                    .then((response) => {
                        app.authenticated_users = response.data.authorized_users;
                    });
            },

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
                this.$refs.editFile.value = ''; 
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

            populateItemDetails: function(itemId) {
                itemId = Number(itemId);  
                const item = this.items.find(item => item.id === itemId);
                this.selectedItemId = item.id;
                this.selectedItemName = item.name;
                this.selectedItemDescription = item.description;
                this.selectedItemImage = item.image; 
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
                        this.selectedItemId = null;
                        this.selectedItemName = null;
                        this.selectedItemDescription = null;
                        this.selectedItemImage = null; // reset selected item image
                    });
                }
            },
            removeItem: function() {
                if (this.selectedItemId) {
                    axios.delete(`/ecobuffet/remove_items/${this.restaurant_id}/${this.selectedItemId}/admin`)
                    .then((response) => {
                        this.getItems();
                        this.selectedItemId = null;
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
    app.get_authorized_users();
});
