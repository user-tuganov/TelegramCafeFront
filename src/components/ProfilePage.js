import React from "react";
import { Link } from "react-router-dom";
import "../css/ProfilePage.css";

function ProfilePage() {
  return (
    <div className="user-profile">
      <h2>Личный кабинет</h2>
      <p><strong>Никнейм:</strong> coffee_lover</p>
      <p><strong>Email:</strong> user@example.com</p>
      <p><strong>Телефон:</strong> +7 (999) 123-45-67</p>

      <Link to="/order-history" className="history-button">
        История заказов
      </Link>

      <Link to="/menu" className="close-history-btn">X</Link>
    </div>
  );
}

export default ProfilePage;
