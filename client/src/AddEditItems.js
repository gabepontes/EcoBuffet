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
          <form onSubmit={handleSubmit} className="mt-4">
            <div>
              <label htmlFor="name" className="block mb-1">
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
            <div className="mt-4">
              <label htmlFor="description" className="block mb-1">
                Description:
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-4">
              <label htmlFor="image" className="block mb-1">
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
{tab === "edit" && (
  <div className="mt-4">
    <h3>Select an item to edit:</h3>
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => handleSelectItem(item)}
        className="bg-gray-200 text-black rounded p-2 m-2"
      >
        {item.name}
      </button>
    ))}
    {selectedItem && (
  <div className="mt-4">
    <label htmlFor="editName" className="block mb-2">
      Name:
    </label>
    <input
      type="text"
      id="editName"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      className="border rounded p-2 w-full"
    />
    <label htmlFor="editDescription" className="block mb-2 mt-4">
      Description:
    </label>
    <textarea
      id="editDescription"
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      className="border rounded p-2 w-full"
    />
    <label htmlFor="editImage" className="block mb-2 mt-4">
      Image:
    </label>
    <div className="mb-2">
      <input
        type="file"
        id="editImage"
        onChange={(e) => setEditImage(e.target.files[0])}
        className="hidden"
      />
      <label
        htmlFor="editImage"
        className="bg-blue-500 text-white px-4 py-2 cursor-pointer rounded"
      >
        Choose File
      </label>
      <div className="mt-2">
        <img
          src={
            editImage
              ? URL.createObjectURL(editImage)
              : `http://localhost:5000/uploads/${selectedItem.image}`
          }
          alt={selectedItem.name}
          className="max-w-xs"
        />
      </div>
    </div>
    <button
      type="button"
      onClick={handleUpdateItem}
      className="bg-green-600 text-white rounded mt-2 p-2"
    >
      Update Item
    </button>
  </div>
)}

  
    
  </div>
)}




</div>
)}
{itemToRemove && (
  <div
    className="fixed z-10 inset-0 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
        &#8203;
      </span>
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Are you sure you want to remove this item?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <strong>Name:</strong> {itemToRemove.name}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Description:</strong> {itemToRemove.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="bg-red-600 text-white rounded p-2 m-2"
            onClick={confirmRemoveItem}
          >
            Remove
          </button>
          <button
            type="button"
            className="bg-gray-600 text-white rounded p-2 m-2"
            onClick={() => setItemToRemove(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{tab === "remove" && (
  <div className="mt-4">
    <h3>Select an item to remove:</h3>
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => handleRemoveItem(item)}
        className="bg-red-600 text-white rounded p-2 m-2"
      >
        {item.name}
      </button>
    ))}
  </div>
)}




</div>
</div>
);
};

export default AddEditItems;
