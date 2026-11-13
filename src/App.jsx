import React, { useEffect, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Routes, Route } from "react-router-dom";
import { LegacyPage } from "./components/routes/legacy";
import { ToastContainer } from "react-toastify";
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
const CategoryHome = lazy(() => import("./pages/category/CategoryHome"));
const SubHome = lazy(() => import("./pages/sub/SubHome"));
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
          .catch((err) => console.log(err));
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
      <ToastContainer />
      <SideDrawer />
      <Routes>
        <Route path="/user/history" element={<UserRoute><LegacyPage component={History} /></UserRoute>} />
        <Route path="/user/password" element={<UserRoute><LegacyPage component={Password} /></UserRoute>} />
        <Route path="/user/wishlist" element={<UserRoute><LegacyPage component={Wishlist} /></UserRoute>} />
        <Route path="/checkout" element={<UserRoute><LegacyPage component={Checkout} /></UserRoute>} />
        <Route path="/payment" element={<UserRoute><LegacyPage component={Payment} /></UserRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><div className="admin-shell"><LegacyPage component={AdminDashboard} /></div></AdminRoute>} />
        <Route path="/admin/category" element={<AdminRoute><div className="admin-shell"><LegacyPage component={CategoryCreate} /></div></AdminRoute>} />
        <Route path="/admin/category/:slug" element={<AdminRoute><div className="admin-shell"><LegacyPage component={CategoryUpdate} /></div></AdminRoute>} />
        <Route path="/admin/sub" element={<AdminRoute><div className="admin-shell"><LegacyPage component={SubCreate} /></div></AdminRoute>} />
        <Route path="/admin/sub/:slug" element={<AdminRoute><div className="admin-shell"><LegacyPage component={SubUpdate} /></div></AdminRoute>} />
        <Route path="/admin/product" element={<AdminRoute><div className="admin-shell"><LegacyPage component={ProductCreate} /></div></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><div className="admin-shell"><LegacyPage component={AllProducts} /></div></AdminRoute>} />
        <Route path="/admin/sliderimageupload" element={<AdminRoute><div className="admin-shell"><LegacyPage component={SliderImageAdd} /></div></AdminRoute>} />
        <Route path="/admin/product/:slug" element={<AdminRoute><div className="admin-shell"><LegacyPage component={ProductUpdate} /></div></AdminRoute>} />
        <Route path="/admin/coupon" element={<AdminRoute><div className="admin-shell"><LegacyPage component={CreateCoupon} /></div></AdminRoute>} />
        <Route path="/product/:slug" element={<LegacyPage component={Product} />} />
        <Route path="/category/:slug" element={<LegacyPage component={CategoryHome} />} />
        <Route path="/sub/:slug" element={<LegacyPage component={SubHome} />} />
        <Route path="/shop" element={<LegacyPage component={Shop} />} />
        <Route path="/cart" element={<LegacyPage component={Cart} />} />
        <Route path="/terms-and-condition" element={<LegacyPage component={TermsAndCondition} />} />
        <Route path="/" element={<LegacyPage component={Home} />} />
        <Route path="/login" element={<LegacyPage component={Login} />} />
        <Route path="/register" element={<LegacyPage component={Register} />} />
        <Route path="/register/complete" element={<LegacyPage component={RegisterComplete} />} />
        <Route path="/forgot/password" element={<LegacyPage component={ForgotPassword} />} />
        <Route path="/contact" element={<LegacyPage component={Contact} />} />
      </Routes>
      <Footer />
    </Suspense>
  );
};

export default App;
