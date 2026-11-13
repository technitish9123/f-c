import React, { useEffect, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import { auth } from "./firebase";
import { useDispatch } from "react-redux";
import { currentUser } from "./functions/auth";
import WeaveMark from "./components/brand/WeaveMark";
import Announcement from "./components/homeComponents/Announcement";
import Footer from "./components/footer/Footer";
import Contact from "./pages/Contact";
import SliderImageAdd from "./pages/admin/SliderImageAdd";
import TermsAndCondition from "./pages/terms-condition";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Home = lazy(() => import("./pages/Home"));
const Header = lazy(() => import("./components/nav/Header"));
const RegisterComplete = lazy(() => import("./pages/auth/RegisterComplete"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const History = lazy(() => import("./pages/user/History"));
const UserRoute = lazy(() => import("./components/routes/UserRoute"));
const AdminRoute = lazy(() => import("./components/routes/AdminRoute"));
const Password = lazy(() => import("./pages/user/Password"));
const Wishlist = lazy(() => import("./pages/user/Wishlist"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CategoryCreate = lazy(() =>
  import("./pages/admin/category/CategoryCreate")
);
const CategoryUpdate = lazy(() =>
  import("./pages/admin/category/CategoryUpdate")
);
const SubCreate = lazy(() => import("./pages/admin/sub/SubCreate"));
const SubUpdate = lazy(() => import("./pages/admin/sub/SubUpdate"));

const ProductCreate = lazy(() => import("./pages/admin/product/ProductCreate"));
const AllProducts = lazy(() => import("./pages/admin/product/AllProducts"));
const ProductUpdate = lazy(() => import("./pages/admin/product/ProductUpdate"));
const Product = lazy(() => import("./pages/Product"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const SideDrawer = lazy(() => import("./components/drawer/SideDrawer"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CreateCoupon = lazy(() => import("./pages/admin/coupon/CreateCoupon"));
const Payment = lazy(() => import("./pages/Payment"));

const App = () => {
  const dispatch = useDispatch();

  // to check firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();

        currentUser(idTokenResult.token)
          .then((res) => {
            dispatch({
              type: "LOGGED_IN_USER",
              payload: {
                name: res.data.name,
                email: res.data.email,
                token: idTokenResult.token,
                role: res.data.role,
                _id: res.data._id,
              },
            });
          })
          .catch(() => {});
      }
    });
    // cleanup
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Suspense
      fallback={
        <div className="page-loader" role="status" aria-label="Loading">
          <WeaveMark size={36} threads={4} />
        </div>
      }
    >
      <Announcement />
      <Header />
      <ToastContainer
        position="bottom-center"
        autoClose={2800}
        hideProgressBar
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss={false}
        draggable={false}
        icon={false}
        transition={Slide}
        limit={3}
        newestOnTop
      />
      <SideDrawer />
      <Routes>
        <Route path="/user/history" element={<UserRoute><History /></UserRoute>} />
        <Route path="/user/password" element={<UserRoute><Password /></UserRoute>} />
        <Route path="/favourites" element={<Wishlist />} />
        <Route path="/user/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
        <Route path="/payment" element={<UserRoute><Payment /></UserRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><div className="admin-shell"><AdminDashboard /></div></AdminRoute>} />
        <Route path="/admin/category" element={<AdminRoute><div className="admin-shell"><CategoryCreate /></div></AdminRoute>} />
        <Route path="/admin/category/:slug" element={<AdminRoute><div className="admin-shell"><CategoryUpdate /></div></AdminRoute>} />
        <Route path="/admin/sub" element={<AdminRoute><div className="admin-shell"><SubCreate /></div></AdminRoute>} />
        <Route path="/admin/sub/:slug" element={<AdminRoute><div className="admin-shell"><SubUpdate /></div></AdminRoute>} />
        <Route path="/admin/product" element={<AdminRoute><div className="admin-shell"><ProductCreate /></div></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><div className="admin-shell"><AllProducts /></div></AdminRoute>} />
        <Route path="/admin/sliderimageupload" element={<AdminRoute><div className="admin-shell"><SliderImageAdd /></div></AdminRoute>} />
        <Route path="/admin/product/:slug" element={<AdminRoute><div className="admin-shell"><ProductUpdate /></div></AdminRoute>} />
        <Route path="/admin/coupon" element={<AdminRoute><div className="admin-shell"><CreateCoupon /></div></AdminRoute>} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/category/:slug" element={<Shop />} />
        <Route path="/sub/:slug" element={<Shop />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/terms-and-condition" element={<TermsAndCondition />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
        <Route path="/forgot/password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Suspense>
  );
};

export default App;
