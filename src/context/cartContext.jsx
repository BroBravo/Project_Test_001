import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "./userContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  const baseURL = process.env.REACT_APP_BASE_URL;
  const navigate=useNavigate();
  const { user, setUser } = useUser();

    const fetchCart = async () => {
    try {

      const res = await axios(`${baseURL}/user/cart/items`, {
         withCredentials: true,       
      });

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartItems(data); // assumes each item includes `id`, `item_name`, etc.
    } catch (err) {
      console.error("Fetch cart failed", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user,cartItems]);

  const addItem = (item) => {
    console.log(item)
    setCartItems((prev) => [...prev, item]);
    console.log(cartItems.length===0)
  };

  const updateQuantity = (index, newQty) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  const removeItem = async (index, itemId) => {
  try {
    await axios.delete(`https://indiadoors.in/back/user/cart/remove/${itemId}`, {
      withCredentials: true,
    });

    // setCartItems(prev => {
    //   const newCart = [...prev];
    //   newCart.splice(index, 1);
    //   return newCart;
    // });
  } catch (err) {
  if (err.response?.data?.code === "TOKEN_EXPIRED" || err.response?.data?.code === "TOKEN_MISSING") {
    
    setUser(null);
    window.alert("Session expired! Login to continue");
  } else {
    console.error("Failed to remove item:", err);
  }
}

};


  const checkout = async() => {
    try
    {

        await axios.get(`${baseURL}/api/auth`, {

        withCredentials: true, // ✅ includes HttpOnly cookie
        });

         console.log("Checking out with items:", cartItems);
         navigate("/checkout");
    }
    catch (err)
    {
      if (err.response?.data?.code === "TOKEN_EXPIRED" || err.response?.data?.code === "TOKEN_MISSING") {
    
      setUser(null);
      window.alert("Session expired! Login to continue");
      } 
    }
  };

  const clearCart=  () => {
    
  };
  return (
    <CartContext.Provider value={{ cartItems, addItem, updateQuantity, removeItem, checkout, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
