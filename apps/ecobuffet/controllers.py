import datetime
import random
import os
import uuid

from py4web import action, request, abort, redirect, URL, HTTP
from py4web.utils.form import Form, FormStyleBulma
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_username
from werkzeug.utils import secure_filename

url_signer = URLSigner(session)

# Py4web actions.
@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        # Signed URLs
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL("get_items", signer=url_signer), 
        add_items_url = URL("add_items", 'index', signer=url_signer),
        edit_items_url = URL("edit_items", 'index', signer=url_signer),
        remove_items_url = URL("remove_items", 'index', signer=url_signer),
    )


# Get a list of all users.
@action("get_users")
@action.uses(db, auth.user)
def get_users():
    users = db(db.auth_user).select().as_list()
    return dict(users=users)

# Get a list of all of the restaurants.
@action("get_restaurants")
@action.uses(db, auth.user)
def get_restaurants():
    restaurants = db(db.restaurant).select().as_list()
    return dict(restaurants=restaurants)

# Define a new action to handle restaurant-specific URLs.
@action('restaurants/<restaurant_id:int>')
@action.uses('restaurant.html', db, auth.user, url_signer)
def restaurant_page(restaurant_id=None):
    assert restaurant_id is not None
    return dict(
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL('get_items', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        like_item_url = URL("like_item", signer=url_signer),
        dislike_item_url = URL("dislike_item", signer=url_signer),
        restaurant_id = restaurant_id
    )

# Adjust the get_items action to accept a restaurant_id parameter.
@action('get_items')
@action.uses(db, auth.user, url_signer.verify())
def get_items():
    restaurant_id = request.params.get('restaurant_id')
    print(f"restaurant_id: {restaurant_id}")
    items = db(db.item.restaurant_id == int(restaurant_id)).select().as_list()
    return dict(items=items)

# Add a new item to the overall item database.
@action('add_item', method=["GET","POST"])
@action.uses(db, url_signer, session, auth.user, 'add_item.html')
def add_item():
    # Create a form to submit a new item.
    form = Form(db.item, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('index'))
    return dict(form=form)

# Add a new restaurant to the overall restaurant database.
@action('add_restaurant', method=["GET","POST"])
@action.uses(db, url_signer, session, auth.user, 'add_restaurant.html')
def add_restaurant():
    # Create a form to submit a new restaurant.
    form = Form(db.restaurant, csrf_session=session, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('index'))
    return dict(form=form)

# Edit an item using the Vue.js methods
@action("/edit_item/<item_id:int>", method="POST")
@action.uses(db, auth.user)
def edit_item(item_id):
    name = request.forms.get("name")
    description = request.forms.get("description")
    image = request.files.get("image")
    if not name or not description:
        raise HTTP(400, "Item must have a name and description")
    item_data = {"name": name, "description": description}

    if image:
        filename = secure_filename(image.filename)
        filename = f"{uuid.uuid4()}_{filename}"
        image_path = os.path.join("uploads", filename)
        image.save(image_path)
        item_data["image"] = filename
    updated_item = db(db.item.id == item_id).update(**item_data)
    
    if updated_item:
        return {"status": "success", "item": item_data}
    else:
        raise HTTP(404, f"Item with id {item_id} not found")

# Remove an item from the item db.
@action("/remove_item/<item_id:int>")
@action.uses(db, session, auth.user, url_signer.verify())
def remove_item(item_id=None):
    assert item_id is not None
    item = db.item[item_id]
    if item is None:
        raise HTTP(404, f"Item with id {item_id} not found")
    else:
        db(db.item.id == item_id).delete()
        redirect(URL('index'))

# Action to like an item
@action('like_item/<item_id:int>')
@action.uses(db, auth.user)
def like_item(item_id=None):
    assert item_id is not None
    db(db.item.id == item_id).update(likes=db.item.likes+1)
    return {"status": "success", "message": "Item liked successfully"}

# Action to dislike an item
@action('dislike_item/<item_id:int>')
@action.uses(db, auth.user)
def dislike_item(item_id=None):
    assert item_id is not None
    db(db.item.id == item_id).update(dislikes=db.item.dislikes+1)
    return {"status": "success", "message": "Item disliked successfully"}

@action('dashboard')
@action.uses('dashboard.html', db, auth.user, url_signer)
def dashboard():
    return dict(
        get_users_url = URL("get_users", signer=url_signer),
        get_items_url = URL("get_items", signer=url_signer)
    )