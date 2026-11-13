import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ConfigProvider } from "antd";

// antd 6 reads the brand from tokens instead of global CSS.
const antdTheme = {
  token: {
    colorPrimary: "#1c1b19",
    colorInfo: "#1c1b19",
    colorLink: "#1c1b19",
    colorText: "#1c1b19",
    colorTextSecondary: "#8b847a",
    colorBorder: "#ddd6cb",
    colorBgContainer: "#fffefc",
    colorBgElevated: "#fffefc",
    borderRadius: 0,
    borderRadiusLG: 0,
    borderRadiusSM: 0,
    fontFamily: '"Jost", "Futura", "Helvetica Neue", Arial, sans-serif',
    boxShadow: "none",
  },
  components: {
    Badge: { colorError: "#1c1b19" },
    Slider: { trackBg: "#1c1b19", trackHoverBg: "#000", handleColor: "#1c1b19", railBg: "#ddd6cb" },
  },
};
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import "./styles/theme.css";

import { createStore, compose } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";

// store
// Redux DevTools when the browser extension is installed.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers());

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider theme={antdTheme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
