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
#    Field('image', 'upload', default='uploads/default_item.png'),
    Field("name", "text"),
    Field("description", "text"),
    Field("restaurant_id", "reference restaurant")
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

def add_restaurants_for_testing(num_restaurants):
    # Test user names begin with "_".
    # Counts how many users we need to add.
#    db(db.restaurant).delete()
#    db(db.day_by_day).delete()
#    db(db.customization).delete()
#    db(db.preference).delete()
#    db(db.item).delete()
#    db(db.auth_user.username.startswith("_")).delete()
    """
    num_test_users = db(db.auth_user.username.startswith("_")).count()
    num_new_users = num_users - num_test_users
    print("Adding", num_new_users, "users.")
    for k in range(num_test_users, num_users):
        first_name = random.choice(FIRST_NAMES)
        last_name = first_name = random.choice(LAST_NAMES)
        username = "_%s%.2i" % (first_name.lower(), k)
        user = dict(
            username=username,
            email=username + "@ucsc.edu",
            first_name=first_name,
            last_name=last_name,
            password=username,  # To facilitate testing.
        )
        auth.register(user, send=False)
        ts = datetime.datetime.utcnow()
            db.meow.insert(**m)
    """
    NUM_ITEMS = 0
    # Add num_restaurants to restaurant database.
    for n in range(num_restaurants):
        m = dict(
            name="blahblah-" + str(n),
        )
        db.restaurant.insert(**m)
        # For each restaurant, add NUM_ITEMS
        for m in range(NUM_ITEMS):
            first_name = random.choice(FIRST_NAMES)
            desc = first_name = random.choice(LAST_NAMES)
            item = dict(
                name=first_name,
                description=desc
            )
            db.item.insert(**item)

    db.commit()
    
# Comment out this line if you are not interested. 
add_restaurants_for_testing(5)