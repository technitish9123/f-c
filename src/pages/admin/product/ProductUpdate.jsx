import React, { useState, useEffect } from "react";
import AdminNav from "../../../components/nav/AdminNav";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  createProduct,
  getProduct,
  updateProduct,
} from "../../../functions/product";
import { getCategories, getSubs } from "../../../functions/category";
import { Spin } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import LocalSearch from "../../../components/forms/LocalSearch";
import FileUpload from "../../../components/forms/FileUpload";
import ProductForm from "../../../components/forms/ProductForm";

const initialState = {
  title: "",
  description: "",
  price: "",
  categories: [],
  category: "",
  subs: [],
  shipping: "",
  quantity: "",
  images: [],
  gst: "",
  color: "",
  material: "",
  property: "",
  design: "",
  style: "",
  application: "",
  instruction: "",
  width: "",
  length: "",
  weight: "",
  repeatlength: "",
  rollLength: "",
};

const ProductUpdate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useSelector((state) => ({ ...state }));

  const [values, setValues] = useState(initialState);
  const [subOptions, setSubOptions] = useState([]);
  const [showSub, setShowSub] = useState(false);
  const [categories, setCategories] = useState([]);
  const [arrSubsIds, setArrSubsIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, []);

  const loadProduct = () => {
    getProduct(slug).then((res) => {
      setValues({ ...values, ...res.data });
      // prepoulation the subs by loading the single category subs
      getSubs(res.data.category._id).then((s) => {
        setSubOptions(s.data);
      });

      //default value loading for subs
      let arr = [];
      res.data.subs.map((s) => {
        arr.push(s._id);
      });
      setArrSubsIds((prev) => arr);
    });
  };

  const loadCategories = () => {
    getCategories().then((c) => {
      setCategories(c.data);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    values.subs = arrSubsIds;
    updateProduct(slug, values, user.token)
      .then((res) => {
        setLoading(false);
        toast.success(`${res.data.title} updated successfully`);
        navigate("/admin/products");
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response.data.err);
      });
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubsChange = (e) => {
    e.preventDefault();
    setValues({ ...values, subs: [], category: e.target.value });
    getSubs(e.target.value).then((res) => {
      setSubOptions(res.data);
    });
    setArrSubsIds([]);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          <AdminNav />
        </div>
        <div className="col-md-10">
          {loading ? <Spin className="mt-3" /> : <h4>Product Update</h4>}
          <div className="p-3">
            <FileUpload
              values={values}
              setValues={setValues}
              setLoading={setLoading}
            />
          </div>

          <ProductForm
            values={values}
            setValues={setValues}
            categories={categories}
            subOptions={subOptions}
            subIds={arrSubsIds}
            setSubIds={setArrSubsIds}
            handleChange={handleChange}
            handleCategoryChange={handleSubsChange}
            handleSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductUpdate;
