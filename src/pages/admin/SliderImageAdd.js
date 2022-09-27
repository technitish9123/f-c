import React, { useState, useEffect } from "react";
import SliderImageUpload from "../../components/forms/SliderImageUpload";
import { uploadSliderImg } from "../../functions/admin";
import { Spin } from "antd";
import AdminNav from "../../components/nav/AdminNav";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
const SliderImageAdd = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const initialState = {
    images: [],
  };
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    uploadSliderImg(values, user.token)
      .then((res) => {
        setLoading(false);
        window.alert(`"${res.data.title}" is created`);
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.response);
        setLoading(false);
        // if(err.response.status === 400) toast.error(`${err.response.data}`)
        toast.error(err.response.data.err);
      });
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2">
          <AdminNav />
        </div>
        <div className="col-md-10">
          {loading ? <Spin /> : <h4>Slider Image Upload </h4>}

          <div className="p-3">
            <SliderImageUpload
              values={values}
              setValues={setValues}
              setLoading={setLoading}
            />

            <button values={values}> Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderImageAdd;
