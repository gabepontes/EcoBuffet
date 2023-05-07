import React from "react";
import { Route, Link, Routes, Navigate } from "react-router-dom";
import SelectedItems from "./SelectedItems";
import AddEditItems from "./AddEditItems";
import "./Admin.css";

const AdminDashboard = () => {
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
          <Route path="/admin/selected-items" element={<SelectedItems />} />
          <Route path="/admin/add-edit-items" element={<AddEditItems />} />
          <Route path="*" element={<Navigate to="/admin/selected-items" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
