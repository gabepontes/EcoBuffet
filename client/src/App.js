import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [foodOptions, setFoodOptions] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/food_options")
      .then((res) => res.json())
      .then((data) => setFoodOptions(data));
  }, []);

  const handleChange = (foodId) => {
    if (selectedFoods.has(foodId)) {
      selectedFoods.delete(foodId);
    } else {
      selectedFoods.add(foodId);
    }
    setSelectedFoods(new Set(selectedFoods));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    fetch("/selected_foods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Array.from(selectedFoods)),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  return (
    <div className="App">
      <div className="overlay"></div>
      {submitted ? (
        <div>
          <div className="opaque-background"></div>
          <div className="thank-you">
            <h2>Thank you for placing your order!</h2>
            <p>Your items are on their way.</p>
            <button className="styled-button" onClick={() => setSubmitted(false)}>
              Go back
            </button>
          </div>
        </div>
      ) : (
        <div className="item-container-wrapper">
          <div className="item-container">
          {foodOptions.map((food, i) => (
  <div
    key={i}
    className={`item-box ${
      selectedFoods.has(food.id) ? "selected" : ""
    }`}
    onClick={() => handleChange(food.id)}
  >
    <img src={`/uploads/${food.image}`} alt={food.name} />
    <div className="item-font">{food.name}</div>
  </div>
))}

          </div>
          <div className="button-wrapper">
            <button onClick={handleSubmit} className="styled-button">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
