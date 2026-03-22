import "./App.css";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductListPage from "./pages/ProductListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import AccountOrdersPage from "./pages/AccountOrdersPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminOrderDetailPage from "./pages/AdminOrderDetailPage.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import axios from "axios";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CancellationRefund from "./pages/policies/CancellationRefund.jsx"
import DeliveryPolicy from "./pages/policies/DeliveryPolicy.jsx";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy.jsx";
import TermsConditions from "./pages/policies/TermsConditions.jsx";
axios.defaults.withCredentials = true

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 w-full">
        <Routes>
          {/* USER ROUTES */}
          <Route element={<><Navbar /><main className="flex-1"><Outlet /></main><Footer /></>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/category/:categorySlug" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/delivery-policy" element={<DeliveryPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<CancellationRefund />} />

            {/* PROTECTED USER ROUTES */}
            <Route element={<PrivateRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account/orders" element={<AccountOrdersPage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            </Route>
          </Route>
        </Routes>
    </div>
  );
}

export default App;
