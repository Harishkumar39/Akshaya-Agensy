import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  // Ref to prevent double-syncing during rapid state changes or StrictMode renders
  const isSyncing = useRef(false);
  // --- 1. INITIAL LOAD LOGIC ---
  const loadCart = async () => {

    if (user) {
      try {
        const { data } = await axios.get(`${API_URL}/api/cart`);

        // Only auto-load from DB if the local state is currently empty
        // This prevents the DB from overwriting the Guest Cart before it merges
        if (data.items && cartItems.length === 0) {
          const sanitizedItems = data.items.map((item) => ({
            _id: item.productId?._id || item._id,
            name: item.productId?.name || item.name || "Unknown Product",
            price: Number(item.variant?.price || item.productId?.price || item.price) || 0,
            imageUrl: item.variant?.imageUrl || item.productId?.images?.[0] || item.imageUrl || "/placeholder.png",
            variant: item.variant || null,
            qty: Number(item.quantity || item.qty) || 1,
          }));
          setCartItems(sanitizedItems);
        }
      } catch (err) {
        console.error("Fetch cart error:", err);
        loadLocalCart();
      }
    } else {
      loadLocalCart();
    }
    setIsInitialized(true);
  };

  const loadLocalCart = () => {
    const local = JSON.parse(localStorage.getItem("myStationeryCart") || "[]");
    setCartItems(local);
  };

  // Run load on mount and when auth state changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // --- 2. DEBOUNCED SYNC LOGIC ---
  useEffect(() => {
    if (!isInitialized) return;

    // Sync to LocalStorage (Immediate)
    localStorage.setItem("myStationeryCart", JSON.stringify(cartItems));

    // Sync to Database (Debounced)
    if (!user) return;

    const syncToDB = async () => {
      if (isSyncing.current) return;
      try {
        isSyncing.current = true;
        await axios.post(
          `${API_URL}/api/cart/sync`,
          { items: cartItems }
        );
      } catch (err) {
        console.error("Background sync failed");
      } finally {
        isSyncing.current = false;
      }
    };

    const timeoutId = setTimeout(syncToDB, 1500); // 1.5s debounce
    return () => clearTimeout(timeoutId);
  }, [cartItems, isInitialized, user]);

  // --- 3. ACTIONS ---

  const addToCart = (product, selectedVariant = null, qty = 1) => {
    const cleanQty = typeof qty === 'number' ? qty : 1;
  
    setCartItems((prev) => {
      // 1. Find if the item already exists
      const existingIndex = prev.findIndex(
        (item) =>
          String(item._id) === String(product._id) &&
          (item.variant?.name || null) === (selectedVariant?.name || null)
      );
  
      if (existingIndex > -1) {
        // 2. Create a shallow copy of the array
        const newCart = [...prev];
        // 3. Create a shallow copy of the item to avoid reference bugs
        const existingItem = { ...newCart[existingIndex] };
        
        // 4. Update quantity
        existingItem.qty = (parseInt(existingItem.qty, 10) || 0) + cleanQty;
        
        newCart[existingIndex] = existingItem;
        return newCart;
      }
  
      // 5. If new, add fresh item
      const finalPrice = product.hasVariants && selectedVariant ? selectedVariant.price : product.price;
  
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: Number(finalPrice) || 0,
        imageUrl: selectedVariant?.imageUrl || (product.images && product.images[0]) || "/placeholder.png",
        variant: selectedVariant || null,
        qty: cleanQty,
      }];
    });
  };

  const removeFromCart = async (id, variantName = null) => {
    // 1. Calculate the new state first
    const updatedCart = cartItems.filter((item) => {
      const isSameId = String(item._id) === String(id);
      const itemVarName = item.variant?.name || null;
      const targetVarName = variantName || null;
      const isSameVariant = itemVarName === targetVarName;
  
      return !(isSameId && isSameVariant);
    });
  
    // 2. Update Local State & LocalStorage Immediately
    setCartItems(updatedCart);
    localStorage.setItem("myStationeryCart", JSON.stringify(updatedCart));
  
    if (user) {
      try {
        await axios.post(`${API_URL}/api/cart/sync`, { items: updatedCart });
      } catch (err) {
        console.error("Failed to sync removal to DB", err);
      }
    }
  };

  const updateQty = (id, variantName, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const isSameId = String(item._id) === String(id);
        
        // Strict Variant Matching (handles null/undefined cases correctly)
        const itemVarName = item.variant?.name || null;
        const targetVarName = variantName || null;
        const isSameVariant = itemVarName === targetVarName;
  
        if (isSameId && isSameVariant) {
          const currentQty = parseInt(item.qty, 10) || 1;
          const newQty = currentQty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("myStationeryCart");

    if (user) {
      try {
        await axios.post(`${API_URL}/api/cart/sync`, { items: [] });
      } catch (err) {
        console.error("Failed to clear database cart:", err);
      }
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    return acc + Number(item.price || 0) * Number(item.qty || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        loadCart,
        totalPrice,
        increaseQty: (id, v) => updateQty(id, v, 1),
        decreaseQty: (id, v) => updateQty(id, v, -1),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};