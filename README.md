# EcoBuffet
Our primary objective for this project is to develop a webpage dedicated to all-you-can-eat (AYCE) restaurants, with a strong focus on minimizing food waste through data-driven insights. We aim to achieve this by creating a platform that not only enhances the dining experience but also enables the restaurant to better understand the demand for specific menu items, allowing them to optimize food production and reduce waste.

The webpage will serve as a one-stop platform for users to explore the AYCE restaurant's offerings, including menu items, pricing, and location. The seamless integration of a reservation system will enable users to secure tables, allowing the restaurant to anticipate customer demand and manage food production accordingly.

A unique feature of our platform will be the intelligent ordering system that tracks which items are being ordered frequently and which are not. By collecting and analyzing this data, the system will provide valuable insights to the restaurant, enabling them to optimize their menu offerings and production processes to minimize food waste.

By merging technology with data-driven insights, our project aspires to elevate the AYCE dining experience at this restaurant, instilling a culture of sustainability and responsible food waste management for both the establishment and its patrons, contributing to a greener, less wasteful environment.

# Contributers
acvuong@ucsc.edu
rhuang43@ucsc.edu
antyu@ucsc.edu
jdahlber@ucsc.edu
gddasilv@ucsc.edu

# Database Format
## restaurant
    Field("name", "text"),
    Field('created_by', 'reference auth_user', default=lambda: auth.user_id)

## item
    Field("name", "text"),
    Field("description", "text"),
    Field('image', 'upload'),
    Field("restaurant_id", "reference restaurant"),
    Field('image', 'upload', default='uploads/default_item.png'),
    Field('likes', 'integer', default=0),
    Field('dislikes', 'integer', default=0),


## day_by_day
    Field('item_id', 'reference item'),
    Field("restaurant_id", "reference restaurant")

## customization
    Field('background', 'upload', default='uploads/default_background.png'),
    Field('logo', 'upload', default='uploads/default_logo.png'),
    Field('restaurant_id', 'reference restaurant')

## preference
    Field("rating", requires=IS_INT_IN_RANGE(0, 2), default=0),
    Field("item_id", "reference item"),
    Field('followed_by', 'reference auth_user', default=lambda: auth.user_id)

# Roadmap
## Sprint 1 
As an admin, I want to add/remove orders.
~~As a customer, I want to order items.~~
As an admin, I want to modify the menu.

## Sprint 2 
As an admin, I want to login and secure the page.
As an admin, I want to be ably to modify the website pictures.
As a customer, I want to be able to see the ingredients of the menu

## Sprint 3
As a customer, I want to see recommendations and popular menu items
As an admin, I want to look at what are the most popular orders for the day before/today.
As a customer, I want to receive personalized recommendations based on my eating preferences and history, enabling me to make more mindful choices during my all-you-can-eat experience

# EcoBuffet Functionalities
## Customer Side
~~login info and table info~~
~~menu(choose preference)~~

## Admin Side-
secure login (no signup)
see the customers preferences(with a sidebar for more options)
edit menu(add,remove,edit, out of stock)
customization page(logo, background costumization)
