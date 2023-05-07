import React, { useState } from "react";
import { Route, Link, Routes, Navigate } from "react-router-dom";
import SelectedItems from "./SelectedItems";
import AddEditItems from "./AddEditItems";
import "./Admin.css";
import LoginForm from "./LoginForm";

const API_BASE_URL = "http://localhost:5000/api";

export default function Admin() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(`${API_BASE_URL}/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      setError(null);
    } else {
      setError("Invalid username or password");
    }
  };

  if (!token) {
    return (
      <LoginForm
        handleSubmit={handleSubmit}
        error={error}
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
      />
    );
  }

  return (
    <div className="admin-container">
      <div className="sidebar">
        <ul>
          <li>
            <Link to="/admin/selected-items">Selected Items</Link>
          </li>
          <li>
            <Link to="/admin/add-edit-items">Add/Edit Items</Link>
          </li>
        </ul>
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/selected-items" element={<SelectedItems />} />
          <Route path="/add-edit-items" element={<AddEditItems />} />
          <Route path="*" element={<Navigate to="/admin/selected-items" />} />
        </Routes>
      </div>
    </div>
  );
}
