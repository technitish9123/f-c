import React, { useEffect, useState } from "react";
import {
  getProductsByCount,
  fetchProductsBySearchFilter,
} from "../functions/product";

import { getCategories } from "../functions/category";
import { getSubs } from "../functions/sub";
import { useSelector, useDispatch } from "react-redux";
import ProductCard from "../components/cards/ProductCard";
import { Spin, Slider, Checkbox, Badge, Button } from "antd";
import Star from "../components/forms/Star";


const colors = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGrey",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGray",
  "DarkSlateGrey",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGray",
  "DimGrey",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "GoldenRod",
  "Gray",
  "Grey",
  "Green",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBlush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightCoral",
  "LightCyan",
  "LightGoldenRodYellow",
  "LightGray",
  "LightGrey",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGray",
  "LightSlateGrey",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquaMarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "NavajoWhite",
  "Navy",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "OrangeRed",
  "Orchid",
  "PaleGoldenRod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
];
const brands = ["Apple", "Microsoft", "Samsung", "Lenovo", "ASUS"];



const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState([]);
  const [ok, setOk] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [star, setStar] = useState();
  const [subs, setSubs] = useState([]);
  const [sub, setSub] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch();

  let { search } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    loadAllProducts();
    loadAllCategories();
    getSubs().then((res) => setSubs(res.data));
  }, []);

  const fetchProducts = (arg) => {
    fetchProductsBySearchFilter(arg).then((res) => {
      setProducts(res.data);
    });
  };

  //1. loading the products by default
  const loadAllProducts = () => {
    setLoading(true);
    getProductsByCount(12).then((p) => {
      setProducts(p.data);
      setLoading(false);
    });
  };

  const dispatcherText = () => {
    dispatch({
      type: "SEARCH_QUERY",
      payload: { text: "" },
    });
  };

  //2. loading the products based on search query

  useEffect(() => {
    const timeOut = setTimeout(() => {
      fetchProducts({ query: search.text });
      if(!search.text) {
        loadAllProducts()
      }
    }, 300);

    return () => clearTimeout(timeOut);
  }, [search.text]);

  //3. load Products based on Price Range

  useEffect(() => {
    fetchProducts({ price });
  }, [ok]);

  const handleSlider = (value) => {
    dispatcherText();
    setPrice(value);
    setCategoryIds([]);
    setStar(0);
    setSub("");
    setColor("");

    setTimeout(() => {
      setOk(!ok);
    }, 300);
  };

  //4. load products based on categories

  const loadAllCategories = () =>
    getCategories().then((res) => setCategories(res.data));

  //show categories im a list of checkbox
  const showCategories = () =>
    categories.map((c) => (
      <div key={c._id}>
        <Checkbox
          className="pb-2 pl-4 pr-4"
          value={c._id}
          onChange={handleCheck}
          name="category"
          checked={categoryIds.includes(c._id)}
        >
          {c.name}
        </Checkbox>
        <br />
      </div>
    ));

  //handle checked value for categories
  const handleCheck = (e) => {
    dispatcherText();
    setPrice([]);
    setStar(0);
    setSub("");
    setColor("");

    let inTheState = [...categoryIds];
    let itemSelected = e.target.value;
    let checkInTheState = inTheState.indexOf(itemSelected);

    if (checkInTheState === -1) {
      inTheState.push(itemSelected);
    } else {
      inTheState.splice(checkInTheState, 1);
    }

    setCategoryIds(inTheState);
    fetchProducts({ category: inTheState });
  };

  // 5. load products based on the Star rating
  const handleStarClick = (num) => {
    dispatcherText();
    setPrice([]);
    setCategoryIds([]);
    setStar(num);
    setSub("");
    setColor("");
    //console.log(num);
    fetchProducts({ stars: num });
  };

  const showStars = () => (
    <div className="pr-4 pl-4 pb-2">
      <Star starClick={handleStarClick} numberOfStars={5} />
      <Star starClick={handleStarClick} numberOfStars={4} />
      <Star starClick={handleStarClick} numberOfStars={3} />
      <Star starClick={handleStarClick} numberOfStars={2} />
      <Star starClick={handleStarClick} numberOfStars={1} />
    </div>
  );

  //7. load products based on subs
  const showSubs = () => (
    <div className="pl-4 pr-4 pb-2">
      {subs.map((s) => (
        <div
          key={s._id}
          className="p-1 m-1 badge badge-info"
          style={{ cursor: "pointer" }}
          onClick={() => handleSub(s)}
        >
          {s.name}
        </div>
      ))}
    </div>
  );

  const handleSub = (sub) => {
    dispatcherText();
    setPrice([]);
    setCategoryIds([]);
    setStar(0);
    setSub(sub);
    setColor("");
    fetchProducts({ sub });
  };

  //load Products ased on colors
  const showColors = () => {
    return (
      <div className="pb-2 pl-4 pr-5 ">
        
      
        {/* {colors.map((c) => (
          <div key={c} className="m-2 ">
            <Button
              block
              style={{ background: c.toLowerCase(), width:"1rem" }}
              onClick={() => handleColorClick(c)}
            >
             { <div className="ml-4">{c}</div>}
            </Button>
            <br />
          </div>
        ))} */}

{colors.map((c) => (
          <div key={c} className="m-2 ">
            <Button
            multiple
              
              style={{ background: c.toLowerCase(), width:"1rem" }}
              onClick={() => handleColorClick(c)}
            >
             { <div className="ml-4">{c}</div>}
            </Button>
            <br />
          </div>
        ))}



      </div>
    );

    
  };

  const handleColorClick = (color) => {
    dispatcherText();
    setPrice([]);
    setCategoryIds([]);
    setStar(0);
    setSub("");
    setColor(color);

    fetchProducts({ color });
  };

  
  //load Products ased on brand
  // const showBrands = () => {
  //   return (
  //     <div className="pb-2 pl-4 pr-5">
  //       {brands.map((c) => (
  //        <div key={c}>
  //        <Checkbox
  //          className="pb-2 pl-4 pr-4"
  //          value={c.name}
  //          onChange={handleCheck}
  //          name="category"
          
  //        >
  //          {c.name}
  //        </Checkbox>
  //        <br />
  //      </div>

  //       ))}
  //     </div>

      
  //   );
  // };
  //console.log(brands);

  // const handleBrandClick = (brand) => {
  //   dispatcherText();
  //   setPrice([]);
  //   setCategoryIds([]);
  //   setStar(0);
  //   setSub("");
  //   setColor();
  //   setBrand(brand)

  //   fetchProducts({ brand });
  // };

  

  return (
    <div className="container-fluid">
      <div className="row">
        <button
          className="shop-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide filters" : "Filters"}
        </button>
        <div className={`col-md-3 shop-filters ${showFilters ? "open" : ""}`}>
          <h4 className="shop-filters__title">Filters</h4>

          <details className="filter" open>
            <summary>Price</summary>
            <Slider
              tooltip={{ formatter: (v) => `₹ ${v}` }}
              range={{ draggableTrack: true }}
              max={20000}
              value={price}
              onChange={handleSlider}
            />
          </details>

          <details className="filter" open>
            <summary>Categories</summary>
            {showCategories()}
          </details>

          <details className="filter" open>
            <summary>Rating</summary>
            {showStars()}
          </details>

          <details className="filter">
            <summary>Sub categories</summary>
            {showSubs()}
          </details>

          <details className="filter">
            <summary>Colours</summary>
            <div className="filter__scroll">{showColors()}</div>
          </details>
        </div>
        <div className="col-md-9">
          {loading ? (
            <Spin />
          ) : (
            <h4 className="section-title">
              Products
            </h4>
          )}

          <div className="row product-grid">
            {products.length > 0 &&
              products.map((p) => (
                <div className="col-md-4" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            {products.length === 0 && (
              <p className="text-warning">No Products Found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
