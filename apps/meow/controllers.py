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
        get_items_url = URL('get_items', signer=url_signer),
        get_restaurants_url = URL("get_restaurants",signer=url_signer),
        add_items_url = URL("add_items",signer=url_signer),
        edit_items_url = URL("edit_items",signer=url_signer),
        remove_items_url = URL("remove_items",signer=url_signer)
    )

# Get a list of all of the restaurants.
@action("get_restaurants")
@action.uses(db, auth.user)
def get_restaurants():
    restaurants = db(db.restaurant).select().as_list()
    return dict(restaurants=restaurants)

# Get the list of reference ids to all of the items the restaurant has.
@action("get_items")
@action.uses(db, auth.user)
def get_items(restaurant_id=None):
    assert restaurant_id != None
    items = db(db.item.restaurant_id == restaurant_id).select().as_list()
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
