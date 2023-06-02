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
    methods: {
      getRestaurants: function() {
        axios.get(getRestaurantsUrl)
          .then((response) => {
            this.restaurants = response.data;
          });
      },
      getItems: function() {
        axios.get(getItemsUrl)
          .then((response) => {
            this.items = response.data;
          });
      },
      addItem: function() {
        const postData = {
          name: this.newItem.name,
          description: this.newItem.description,
        };
        axios.post(addItemsUrl, postData)
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
          };
          axios.post(removeItemsUrl, postData)
            .then((response) => {
              this.getItems();  
            });
        }
      },
    },
    created: function() {
      this.restaurant_id = 1
      this.getRestaurants();
      this.getItems();
    }
  });
  