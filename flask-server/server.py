import os
import eventlet
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from datetime import datetime
from collections import Counter
import firebase_admin
import uuid
from firebase_admin import credentials, db
from werkzeug.utils import secure_filename
import json
import jwt


eventlet.monkey_patch()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

current_date = datetime.now().strftime("%Y-%m-%d")
ref = db.reference(f"selected_foods/{current_date}", url="https://dubzpizza-1bfc8-default-rtdb.firebaseio.com/")
items_ref = db.reference("items", url="https://dubzpizza-1bfc8-default-rtdb.firebaseio.com/")

FIREBASE_URL = "https://dubzpizza-1bfc8-default-rtdb.firebaseio.com/"

SECRET_KEY = "your_secret_key"
ADMIN_USERNAME = "1"
ADMIN_PASSWORD = "1"

@app.route("/api/authenticate", methods=["POST"])
def authenticate():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        token = jwt.encode({"username": username}, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})
    else:
        return jsonify({"message": "Invalid username or password"}), 401

@app.route("/food_options")
def get_food_options():
    food_options = items_ref.get()
    if food_options is None:
        return jsonify([])
    processed_food_options = []
    for food in food_options:
        if food is not None and food.get('image') is not None:
            food["image"] = f"{food['image'].split('/')[-1]}"
            processed_food_options.append(food)
    return jsonify(processed_food_options)

@app.route("/selected_foods", methods=["POST"])
def post_selected_foods():
    selected_foods = request.get_json()
    selected_foods = [int(food_id) for food_id in selected_foods]
    new_selected_foods = ref.push({"selectedFoods": selected_foods})
    return jsonify({"status": "success", "selectedFoods": selected_foods})

def get_selected_foods_data():
    response = requests.get(FIREBASE_URL + f"selected_foods/{current_date}.json")
    if response.status_code == 200:
        return response.json()
    else:
        return {}

def process_food_counts(selected_foods_data):
    all_selected_foods = []
    for data in selected_foods_data.values():
        if isinstance(data, dict) and "selectedFoods" in data:
            selected_foods = data["selectedFoods"]
            all_selected_foods.extend(selected_foods)
    food_counts = Counter(all_selected_foods)
    sorted_food_counts = sorted(food_counts.items(), key=lambda x: x[1], reverse=True)
    return [{"id": str(food_id), "count": count} for food_id, count in sorted_food_counts]

@app.route('/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'uploads'), filename)

@socketio.on("admin_connected")
def handle_admin_connected():
    print("Admin connected")
    send_current_data_to_admin()

def send_current_data_to_admin():
    selected_foods_data = get_selected_foods_data()
    result = process_food_counts(selected_foods_data)
    socketio.emit("selected_foods_update", result)

@app.route('/add_item', methods=['POST'])
def add_item():
    name = request.form.get("name")
    category = request.form.get("category")
    description = request.form.get("description")
    price = request.form.get("price")
    image = request.files.get("image")
    
    # Generate a unique filename for the uploaded image
    filename = secure_filename(image.filename)
    filename = f"{uuid.uuid4()}_{filename}"

    # Save the image to the 'uploads' folder
    image.save(os.path.join("uploads", filename))

    # Get the current maximum ID from the database
    items = items_ref.get()
    if items is None:
        new_id = "1"
    else:
        new_id = str(max([int(item['id']) for item in items if item is not None and item['id'] is not None]) + 1)

    # Save the new item data to the database
    items_ref.child(new_id).set({
        "id": new_id,
        "name": name,
        "category": category,
        "description": description,
        "price": price,
        "image": filename
    })

    return jsonify({"message": "Item added successfully", "id": new_id}), 201

@app.route("/items")
def get_items():
    items_data = items_ref.get()
    if items_data is None:
        return jsonify([])
    items_list = [item for item in items_data if item is not None]
    return jsonify(items_list)


@app.route("/edit_item/<item_id>", methods=["PUT"])
def edit_item(item_id):
    name = request.form.get("name")
    description = request.form.get("description")
    image = request.files.get("image")

    if not name or not description:
        return jsonify({"status": "error", "message": "Item must have a name and description"}), 400

    item_data = {"name": name, "description": description}

    if image:
        # Generate a unique filename for the uploaded image
        filename = secure_filename(image.filename)
        filename = f"{uuid.uuid4()}_{filename}"

        # Save the image to the 'uploads' folder
        image.save(os.path.join("uploads", filename))

        item_data["image"] = filename

    if items_ref.child(item_id).get() is not None:
        items_ref.child(item_id).update(item_data)
        return jsonify({"status": "success", "item": item_data})
    else:
        return jsonify({"status": "error", "message": f"Item with id {item_id} not found"}), 404

@app.route("/remove_item/<string:item_id>", methods=["DELETE"])
def remove_item(item_id):
    if items_ref.child(item_id).get() is not None:
        items_ref.child(item_id).delete()
        return jsonify({"status": "success", "id": item_id})
    else:
        return jsonify({"status": "error", "message": f"Item with id {item_id} not found"}), 404





if __name__ == "__main__":
    socketio.run(app, debug=True)

