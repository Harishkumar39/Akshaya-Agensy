import Cart from "../models/Cart.js";

export const syncCart = async (req, res) => {
  const { items } = req.body;
  const userId = req.user._id;

  try {
    const sanitizedItems = items.map((item) => ({
      productId: item._id,
      quantity: Math.min(Math.max(parseInt(item.qty, 10) || 1, 1), 1000),
      price: Number(item.price) || 0,
      variant: item.variant || null
    }));

    // Use lean() for faster performance since we are just returning the doc
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: sanitizedItems },
      { new: true, upsert: true, lean: true }
    ).populate("items.productId");

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Sync failed" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    if (!cart) return res.status(200).json({ items: [] });

    const transformedItems = cart.items.map((item) => {
      if (!item.productId) return null;
      
      const fallbackImage = Array.isArray(item.productId.images) ? item.productId.images[0] : item.productId.imageUrl;

      return {
        _id: item.productId._id,
        name: item.productId.name,
        price: item.variant ? item.variant.price : item.productId.price,
        imageUrl: item.variant?.imageUrl || fallbackImage || "/placeholder.png",
        variant: item.variant,
        qty: item.quantity // Database uses 'quantity', frontend uses 'qty'
      };
    }).filter(Boolean);

    res.status(200).json({ items: transformedItems });
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};