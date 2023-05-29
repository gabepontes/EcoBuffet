"""
This file defines the database models
"""

import datetime
import random
from py4web.utils.populate import FIRST_NAMES, LAST_NAMES, IUP
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_username():
    return auth.current_user.get('username') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    "restaurant",
    Field("name", "text"),
    Field('created_by', 'reference auth_user', default=lambda: auth.user_id)
)

db.define_table(
    "item",
    Field("name", "text"),
    Field("description", "text"),
    Field('image', 'upload'),
    Field("restaurant_id", "reference restaurant"),
    Field('image', 'upload', default='uploads/default_item.png'),
    Field('likes', 'integer', default=0),
    Field('dislikes', 'integer', default=0),
)

db.define_table(
    "day_by_day",
    Field('item_id', 'reference item'),
    Field("restaurant_id", "reference restaurant")
)

db.define_table(
    "customization",
    Field('background', 'upload', default='uploads/default_background.png'),
    Field('logo', 'upload', default='uploads/default_logo.png'),
    Field('restaurant_id', 'reference restaurant')
)

db.define_table(
    "preference",
    Field("rating", requires=IS_INT_IN_RANGE(0, 2), default=0),
    Field("item_id", "reference item"),
    Field('followed_by', 'reference auth_user', default=lambda: auth.user_id)
)



db.commit()

FOOD_NAMES = ["Pizza", "Burger", "Pasta", "Sushi", "Salad", "Soup", "Steak", "Tacos", "Fish", "Chicken", "Extremely Long Food Name"]
FOOD_DESCRIPTIONS = ["Italian style pizza", "Cheeseburger with fries", "Pasta with tomato sauce", 
                     "Fresh sushi platter", "Healthy green salad", "Hot chicken soup", "Grilled steak with vegetables", 
                     "Mexican tacos", "Grilled fish with lemon", "Fried chicken"]

# To clear out the database locked error, restart server while having the testing code commented out.
# To clear out the '_thread._local' object has no attribute 'request_ctx' error, clear the database + restart server.
def clear_databases():
    db(db.restaurant).delete()
    db(db.item).delete()
    db(db.day_by_day).delete()
    db(db.customization).delete()
    db(db.preference).delete()

def add_restaurants_for_testing(num_restaurants, num_items_per_restaurant):
    clear_databases()
    # Add num_restaurants to restaurant database.
    for n in range(num_restaurants):
        m = dict(
            name="Restaurant-" + str(n),
        )
        restaurant_id = db.restaurant.insert(**m)  # save the ID of the new restaurant
        # For each restaurant, add num_items_per_restaurant
        for m in range(num_items_per_restaurant):
            food_name = random.choice(FOOD_NAMES)
            food_description = random.choice(FOOD_DESCRIPTIONS)
            item = dict(
                name=food_name,
                description=food_description,
                restaurant_id=restaurant_id  # assign the restaurant_id to the item
            )
            db.item.insert(**item)

    db.commit()

# # Create 5 restaurants each with 10 items
add_restaurants_for_testing(5, 10)

