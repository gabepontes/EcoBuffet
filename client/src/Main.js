import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './App';
import Admin from './Admin';
import { ChakraProvider } from "@chakra-ui/react";
import AddEditItems from './AddEditItems';

export default function Main() {
  return (
    <Router>
          <ChakraProvider>
      <DndProvider backend={HTML5Backend}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/add-edit-items" element={<AddEditItems />} />
        </Routes>
      </DndProvider>
      </ChakraProvider>
    </Router>
  );
}
