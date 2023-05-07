import React from "react";

export default function SelectedItems({ selectedPizzas, getPizzaName, loading }) {
  return (
    <div>
      <h1 className="title">Selected Pizzas</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        selectedPizzas && (
          <ul>
            {selectedPizzas.map((pizza, index) => (
              <li key={index}>
                {getPizzaName(pizza.id)} - {pizza.count} votes
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
