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

PASSWORD = '123'  

@action('admin/<restaurant_id:int>', method=["GET", "POST"])
@action.uses('admin.html', session, url_signer)  
def admin(restaurant_id=None):
    assert restaurant_id is not None

    password = request.forms.get('password')  
    if request.method == "POST":
        if password != PASSWORD:
            return HTTP(401, 'Unauthorized')

    restaurant = db(db.restaurant.id == restaurant_id).select().first()  
    restaurant_name = restaurant.name if restaurant else ""  

    return dict(
        restaurant_id = restaurant_id,
        restaurant_name = restaurant_name,  
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL('get_items', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        add_items_url = URL("add_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        edit_items_url = URL("edit_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        remove_items_url = URL("remove_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
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

    restaurant = db(db.restaurant.id == restaurant_id).select().first()  
    restaurant_name = restaurant.name if restaurant else ""  

    return dict(
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL('get_items', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        get_restaurant_name_url = URL('get_restaurant_name', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        like_item_url = URL("like_item", signer=url_signer),
        dislike_item_url = URL("dislike_item", signer=url_signer),
        restaurant_id = restaurant_id,
        restaurant_name = restaurant_name  
    )


# Get the restaurant.name
@action("get_restaurant_name")
@action.uses(db, auth.user, url_signer.verify())
def get_restaurant_name():
    restaurant_name=""
    restaurant_id = request.params.get('restaurant_id')
    print(f"restaurant_id: {restaurant_id}")
    restaurant_rows = db(db.restaurant.id == int(restaurant_id)).select()
    for row in restaurant_rows:
        restaurant_name = row.name
    print(restaurant_name)
    return dict(restaurant_name=restaurant_name)

# Adjust the get_items action to accept a restaurant_id parameter.
@action('get_items')
@action.uses(db, auth.user)  
def get_items():
    restaurant_id = request.params.get('restaurant_id')
    print(f"restaurant_id: {restaurant_id}")
    items = db(db.item.restaurant_id == int(restaurant_id)).select().as_list()
    return dict(items=items)


# Add a new item to the overall item database.
@action('add_items/<restaurant_id:int>/admin', method=["GET", "POST"])
@action.uses(db, session, url_signer, 'add_items.html')
def add_items(restaurant_id=None):
    assert restaurant_id is not None
    if request.method == "POST":
        filepath = None  
        if 'image' in request.files:
            image = request.files.image
            if image.filename != '':
                filename = secure_filename(image.filename)
                filepath = os.path.join('uploads', filename)
                with open(filepath, 'wb') as f:
                    f.write(image.file.read())
        name = request.params.get('name')
        description = request.params.get('description')
        db.item.insert(name=name, description=description, image=filepath, restaurant_id=restaurant_id)
        return "success"
    else:
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
@action('edit_items/<restaurant_id:int>/<item_id:int>/admin', method=["GET", "POST"])
@action.uses(db, session, url_signer, 'edit_items.html')
def edit_items(restaurant_id=None, item_id=None):
    assert restaurant_id is not None
    assert item_id is not None
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
@action('remove_items/<restaurant_id:int>/<item_id:int>/admin', method=["GET", "POST", "DELETE"])
@action.uses(db, session, url_signer, 'remove_items.html')
def remove_items(restaurant_id=None, item_id=None):
    assert restaurant_id is not None
    assert item_id is not None
    item = db.item[item_id]
    if item is None:
        raise HTTP(404, f"Item with id {item_id} not found")
    else:
        db(db.item.id == item_id).delete()
        redirect(URL('index'))

# Action to like an item
@action('like_item', method="POST")
@action.uses(db, auth.user)
def like_item():
    item_id = request.json.get("item_id")
    db(db.item.id == item_id).update(likes=db.item.likes+1)
    row_likes = db(db.item.id == item_id).select()
    for row in row_likes:
        likes = row.likes
    return dict(status="success",message="Item liked successfully",likes=likes)

# Action to dislike an item
@action('dislike_item', method="POST")
@action.uses(db, auth.user)
def dislike_item():
    item_id = request.json.get("item_id")
    db(db.item.id == item_id).update(dislikes=db.item.dislikes+1)
    row_dislikes = db(db.item.id == item_id).select()
    for row in row_dislikes:
        dislikes = row.dislikes
    return dict(status="success",message="Item disliked successfully",dislikes=dislikes )

@action('dashboard')
@action.uses('dashboard.html', db, auth.user, url_signer)
def dashboard():
    return dict(
        get_users_url = URL("get_users", signer=url_signer),
        get_items_url = URL("get_items", signer=url_signer)
    )