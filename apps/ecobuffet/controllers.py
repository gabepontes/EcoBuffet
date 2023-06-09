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

@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def landing():
    return dict(
        # Signed URLs
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
    )

# Py4web actions.
@action('landing')
@action.uses('landing.html', db, auth.user, url_signer)
def index():
    print(f"ID: {auth.user_id}")
    return dict(
        # Signed URLs
        user_id = auth.user_id,
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL("get_items", signer=url_signer), 
        add_items_url = URL("add_items", 'index', signer=url_signer),
        edit_items_url = URL("edit_items", 'index', signer=url_signer),
        remove_items_url = URL("remove_items", 'index', signer=url_signer),
    )

PASSWORD = '123'  

@action('admin/<restaurant_id:int>', method=["GET", "POST"])
@action.uses('admin.html', session, auth.user, url_signer)  
def admin(restaurant_id=None):
    assert restaurant_id is not None
    print("Entering admin mode!")
    
    restaurant = db(db.restaurant.id == restaurant_id).select().first()
    if restaurant.authorized_users == None:
        redirect(URL('landing'))
    restaurant_name = restaurant.name if restaurant else ""
    print(auth.user_id not in restaurant.authorized_users)
    print(auth.user_id)
    print(restaurant.authorized_users)
    if auth.user_id not in restaurant.authorized_users:
        return HTTP(401, 'Unauthorized')

    return dict(
        restaurant_id = restaurant_id,
        restaurant_name = restaurant_name,
        search_url = URL("search", signer=url_signer),
        add_authorized_user_url = URL("add_authorized_user", signer=url_signer),
        delete_authorized_user_url = URL("delete_authorized_user", signer=url_signer),
        get_users_url = URL("get_users", signer=url_signer),
        get_special_users_url = URL("get_authorized_users", signer=url_signer),
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_items_url = URL('get_items', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        add_items_url = URL("add_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        edit_items_url = URL("edit_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        remove_items_url = URL("remove_items", 'admin', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
    )

@action('search', method=["GET"])
@action.uses()
def search():
    # Search for the text in the user db.
    results = []
    user_search = request.params.get("query")
    print(f"Adding query - {user_search}")
    users = db(db.auth_user).select()
    print(users)
    # Slice the array so we can see if the initial
    # string matches.
    for u in users:
        try:
            if user_search == u.username[0:len(user_search)]:
                results.append(u)
        except IndexError:
            pass
    return dict(results=results)


@action("get_authorized_users", method=["GET","POST"])
@action.uses(db, auth.user)
def get_authorized_users():
    restaurant_id = request.params.get("restaurant_id")
    print(restaurant_id)
    restaurant = db(db.restaurant.id == restaurant_id).select().first()
    names = []
    users = db(db.auth_user).select().as_list()
    for user in users:
        for id in restaurant["authorized_users"]:
            if id == user["id"]:
                names.append(user["username"])
    return dict(authorized_users=names)
    

@action("add_authorized_user", method=["GET","POST"])
@action.uses(db, auth.user)
def add_authorized_user():
    user = request.params.get("user")
    restaurant_id = request.params.get("restaurant_id")
    print(f"Adding authorized user #{user}")
    print(f"Adding authorized user to restaurant #{restaurant_id}")
    restaurant = db(db.restaurant.id == restaurant_id).select().first()
    # Don't add duplicates.
    if int(user) not in restaurant["authorized_users"]:
        restaurant["authorized_users"] += [user]
    db(db.restaurant.id == restaurant_id).update(authorized_users = restaurant["authorized_users"])
    print(restaurant["authorized_users"])
    db.commit()
    names = []
    users = db(db.auth_user).select().as_list()
    for user in users:
        for id in restaurant["authorized_users"]:
            if id == user["id"]:
                names.append(user["username"])
    return dict(authorized_users=names)

@action("delete_authorized_user", method=["GET","POST"])
@action.uses(db, auth.user, url_signer.verify())
def delete_authorized_user():
    user = request.params.get("user")
    restaurant_id = request.params.get("restaurant_id")
    if user == -1:
        return
    print(f"Removing authorized user #{user}")
    print(f"Removing authorized user to restaurant #{restaurant_id}")
    restaurant = db(db.restaurant.id == restaurant_id).select().first()

    # Don't remove something that isn't there.
    if int(user) in restaurant["authorized_users"]:
        restaurant["authorized_users"].remove(int(user))
    db(db.restaurant.id == restaurant_id).update(authorized_users = restaurant["authorized_users"])
    print(restaurant["authorized_users"])
    db.commit()
    names = []
    users = db(db.auth_user).select().as_list()
    for user in users:
        for id in restaurant["authorized_users"]:
            if id == user["id"]:
                names.append(user["username"])
    return dict(authorized_users=names)

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
    return dict(restaurants=restaurants, user_id=auth.user_id)

# Define a new action to handle restaurant-specific URLs.
@action('restaurants/<restaurant_id:int>')
@action.uses('restaurant.html', db, auth.user, url_signer)
def restaurant_page(restaurant_id=None):
    assert restaurant_id is not None

    restaurant = db(db.restaurant.id == restaurant_id).select().first()  
    restaurant_name = restaurant.name if restaurant else ""  

    return dict(
        get_restaurants_url = URL("get_restaurants", signer=url_signer),
        get_user_likes_url = URL("get_user_likes", vars=dict(restaurant_id=restaurant_id), signer=url_signer),
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
    restaurant_description = ""
    restaurant_id = request.params.get('restaurant_id')
    print(f"restaurant_id: {restaurant_id}")
    restaurant_rows = db(db.restaurant.id == int(restaurant_id)).select()
    for row in restaurant_rows:
        restaurant_name = row.name
        restaurant_description = row.description
    print(restaurant_name)
    return dict(restaurant_name=restaurant_name, restaurant_description=restaurant_description)

# Adjust the get_items action to accept a restaurant_id parameter.
@action('get_items')
@action.uses(db, auth.user)  
def get_items():
    restaurant_id = request.params.get('restaurant_id')
    print(f"restaurant_id: {restaurant_id}")
    items = db(db.item.restaurant_id == int(restaurant_id)).select().as_list()
    return dict(items=items)

# Get list of all users likes and dislikes of restuarant items
@action("get_user_likes")
@action.uses(db, auth.user)
def get_user_likes():
    restaurant_id = request.params.get('restaurant_id')
    user_likes = db(db.user_item_preference.restaurant_id == int(restaurant_id)).select().as_list()
    return dict(user_likes=user_likes)

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
                filepath = os.path.join('apps','ecobuffet', 'static','images', filename)
                filepath2 = os.path.join('ecobuffet', 'static','images', filename)
                with open(filepath, 'wb') as f:
                    f.write(image.file.read())
        name = request.params.get('name')
        description = request.params.get('description')
        db.item.insert(name=name, description=description, image=filepath2, restaurant_id=restaurant_id)
        return "success"
    else:
        form = Form(db.item, csrf_session=session, formstyle=FormStyleBulma)
        if form.accepted:
            redirect(URL('landing'))
        return dict(form=form)

# Add a new restaurant to the overall restaurant database.
@action('add_restaurant', method=["GET","POST"])
@action.uses(db, url_signer, session, auth.user, 'add_restaurant.html')
def add_restaurant():
    # Create a form to submit a new restaurant.
    form = Form(db.restaurant, csrf_session=session, formstyle=FormStyleBulma)
    
    if form.accepted:
        redirect(URL('landing'))
    return dict(form=form)

# Edit an item using the Vue.js methods
@action('edit_items/<restaurant_id:int>/<item_id:int>/admin', method=["GET", "POST"])
@action.uses(db, session, url_signer, 'edit_items.html')
def edit_items(restaurant_id=None, item_id=None):
    assert restaurant_id is not None
    assert item_id is not None
    if request.method == "POST":
        item = db.item[item_id]
        if item is None:
            raise HTTP(404)
        
        filepath = None
        if 'image' in request.files:
            image = request.files.image
            if image.filename != '':
                filename = secure_filename(image.filename)
                filepath = os.path.join('apps','ecobuffet', 'static','images', filename)
                filepath2 = os.path.join('ecobuffet', 'static','images', filename)
                with open(filepath, 'wb') as f:
                    f.write(image.file.read())
                item.update_record(image=filepath2)
                
        name = request.params.get('name')
        description = request.params.get('description')
        if name is not None:
            item.update_record(name=name)
        if description is not None:
            item.update_record(description=description)

        redirect(URL('landing'))
    else:
        form = Form(db.item, record=db.item[item_id], csrf_session=session, formstyle=FormStyleBulma)
        if form.accepted:
            redirect(URL('landing'))
        return dict(form=form)


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
        redirect(URL('landing'))

# Action to like an item
@action('like_item', method="POST")
@action.uses(db, auth.user)
def like_item():
    me = auth.current_user.get("username")
    item_id = request.json.get("item_id")
    delete = request.json.get("del")
    name = db.item[item_id].name
    restaurant_id = db.item[item_id].restaurant_id
    if (delete == False):
        item = dict(
            restaurant_id= restaurant_id,
            item_name=name,
            user=me,
            like=True
        )
        db.user_item_preference.insert(**item)
        db(db.item.id == item_id).update(likes=db.item.likes+1)
        row_likes = db(db.item.id == item_id).select()
        for row in row_likes:
            likes = row.likes
        return dict(status="success",message="Item liked successfully",likes=likes)
    else:
        db((db.user_item_preference.item_name == name) & 
           (db.user_item_preference.restaurant_id == restaurant_id)).delete()
        db(db.item.id == item_id).update(likes=db.item.likes-1)
        row_likes = db(db.item.id == item_id).select()
        for row in row_likes:
            likes = row.likes
        return dict(status="success",message="Item unliked successfully",likes=likes)
    

# Action to dislike an item
@action('dislike_item', method="POST")
@action.uses(db, auth.user)
def dislike_item():
    me = auth.current_user.get("username")
    item_id = request.json.get("item_id")
    delete = request.json.get("del")
    name = db.item[item_id].name
    restaurant_id = db.item[item_id].restaurant_id
    if (delete == False):
        item = dict(
            restaurant_id= restaurant_id,
            item_name=name,
            user=me,
            like=False
        )
        db.user_item_preference.insert(**item)
        db(db.item.id == item_id).update(dislikes=db.item.dislikes+1)
        row_dislikes = db(db.item.id == item_id).select()
        for row in row_dislikes:
            dislikes = row.dislikes
        return dict(status="success",message="Item disliked successfully",dislikes=dislikes )
    else:
        db((db.user_item_preference.item_name == name) & 
           (db.user_item_preference.restaurant_id == restaurant_id)).delete()
        db(db.item.id == item_id).update(dislikes=db.item.dislikes-1)
        row_dislikes = db(db.item.id == item_id).select()
        for row in row_dislikes:
            dislikes = row.dislikes
        return dict(status="success",message="Item undisliked successfully",dislikes=dislikes )

@action('dashboard/<restaurant_id:int>')
@action.uses('dashboard.html', db, auth.user, url_signer)
def dashboard(restaurant_id=None):
    assert restaurant_id is not None
    print("Entering dashboard mode!")
    
    restaurant = db(db.restaurant.id == restaurant_id).select().first()
    if restaurant.authorized_users == None:
        redirect(URL('landing'))
    
    if auth.user_id not in restaurant.authorized_users:
        return HTTP(401, 'Unauthorized')

    return dict(
        restaurant_id = restaurant_id,
        restaurant_name = restaurant.name,
        restaurant_description = restaurant.description,
        get_users_url = URL("get_users", signer=url_signer),
        get_items_url = URL('get_items', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        get_user_likes_url = URL("get_user_likes", vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        get_restaurant_name_url = URL('get_restaurant_name', vars=dict(restaurant_id=restaurant_id), signer=url_signer),
        modify_restaurant_description_url = URL("modify_restaurant_description", signer=url_signer),
        modify_restaurant_name_url = URL("modify_restaurant_name", signer=url_signer)
    )


# Action to modify restaurant name
@action('modify_restaurant_name', method="POST")
@action.uses(db, auth.user)
def modify_restaurant_name():
    restaurant_id = request.json.get("restaurant_id")
    restaurant_name = request.json.get("restaurant_name")
    print(f"MODIFY NAME: {restaurant_id}, {restaurant_name}")
    db(db.restaurant.id == restaurant_id).update(name = restaurant_name)
    return dict(name=restaurant_name)
    

# Action to modify restaurant description
@action('modify_restaurant_description', method="POST")
@action.uses(db, auth.user)
def modify_restaurant_description():
    restaurant_id = request.json.get("restaurant_id")
    restaurant_description = request.json.get("restaurant_description")
    print(f"MODIFY DESC: {restaurant_id}, {restaurant_description}")
    db(db.restaurant.id == restaurant_id).update(description = restaurant_description)
    return dict(description=restaurant_description)