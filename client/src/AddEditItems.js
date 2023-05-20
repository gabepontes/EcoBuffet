import React, { useState, useEffect } from "react";
import axios from "axios";

const AddEditItems = () => {
  const [tab, setTab] = useState("add");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);


const onFileChange = (e) => setImage(e.target.files[0]);
const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [editName, setEditName] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editImage, setEditImage] = useState(null);

const [showRemoveModal, setShowRemoveModal] = useState(false);
const [itemToRemove, setItemToRemove] = useState(null);


useEffect(() => {
  fetchItems();
}, []);

const fetchItems = async () => {
  try {
    const response = await axios.get("http://localhost:5000/items");
    setItems(response.data);
  } catch (error) {
    console.error("Error fetching items:", error);
    alert("Error fetching items.");
  }
};


const handleSelectItem = (item) => {
  setSelectedItem(item);
  setEditName(item.name);
  setEditDescription(item.description);
  setEditImage(null);
};


const handleUpdateItem = async () => {
  const formData = new FormData();
  formData.append("name", editName);
  formData.append("description", editDescription);
  if (editImage) {
    formData.append("image", editImage);
  }

  try {
    const response = await axios.put(
      `http://localhost:5000/edit_item/${selectedItem.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.status === "success") {
      alert("Item updated successfully!");
      fetchItems();
    } else {
      alert("Error: " + response.data.message);
    }
  } catch (error) {
    console.error("Error updating item:", error);
    alert("Error updating item.");
  }
};

const handleRemoveItem = (item) => {
  setItemToRemove(item);
};

const confirmRemoveItem = async () => {
  try {
    const response = await axios.delete(`http://localhost:5000/remove_item/${itemToRemove.id}`);

    if (response.data.status === "success") {
      alert("Item removed successfully!");
      setItems(items.filter(item => item.id !== itemToRemove.id)); // Update the items list after successful deletion
      fetchItems();
    } else {
      alert("Error: " + response.data.message);
    }
  } catch (error) {
    console.error("Error removing item:", error);
    alert("Error removing item.");
  }
  setItemToRemove(null);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !image) {
      alert("Please fill all the fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/add_item", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        alert("Item added successfully!");
        setName("");
        setDescription("");
        setImage(null);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: Unable to add the item.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full md:w-3/4 lg:w-1/2">
        <div className="flex justify-between">
          <button
            className={`px-4 py-2 ${tab === "add" ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-600"} rounded-md`}
            onClick={() => setTab("add")}
          >
            Add Item
          </button>
          <button
            className={`px-4 py-2 ${tab === "edit" ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-600"} rounded-md`}
            onClick={() => setTab("edit")}
          >
            Edit Item
          </button>
          <button
            className={`px-4 py-2 ${tab === "remove" ? "bg-blue-600 text-white" : "bg-blue-200 text-blue-600"} rounded-md`}
            onClick={() => setTab("remove")}
          >
            Remove Item
          </button>
        </div>
        {tab === "add" && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description:
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image:
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={onFileChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
              Submit
            </button>
          </form>
        )}
        {tab === "edit" && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Select an item to edit:</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="bg-gray-200 text-black rounded p-2"
                >
                  {item.name}
                </button>
              ))}
            </div>
            {selectedItem && (
              <div className="mt-4 space-y-4">
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">
                Name:
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">
                  Description:
                </label>
                <textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <label htmlFor="editImage" className="block text-sm font-medium text-gray-700">
                  Image:
                </label>
                <input
                  type="file"
                  id="editImage"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button onClick={handleUpdateItem} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                  Update
                </button>
              </div>
            )}
          </div>
        )}
{tab === "remove" && (
  <div className="mt-4">
    <h3 className="text-lg font-semibold mb-2">Select an item to remove:</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleRemoveItem(item)}
          className="bg-red-500 text-white rounded p-2"
        >
          {item.name}
        </button>
      ))}
    </div>
    {itemToRemove && (
      <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-2">{itemToRemove.name}</h4>
        <p className="text-sm mb-2">
          <span className="font-semibold">Description: </span>
          {itemToRemove.description}
        </p>
        <div className="mb-4">
          <span className="font-semibold">Image: </span>
          <img
            src={`http://localhost:5000/uploads/${itemToRemove.image}`}
            alt={itemToRemove.name}
            className="w-48 h-32 object-cover rounded"
          />
        </div>
        <button
          onClick={confirmRemoveItem}
          className="bg-red-600 text-white px-4 py-1 rounded"
        >
          Confirm Remove
        </button>
      </div>
    )}
  </div>
)}



      </div>
    </div>
  );
};

export default AddEditItems;

