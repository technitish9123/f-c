// react-star-ratings ships Babel-compiled CommonJS; under Vite its default
// import arrives as { default: Component }. Unwrap it once here.
import * as mod from "react-star-ratings";

const StarRatings = mod.default?.default ?? mod.default ?? mod;

export default StarRatings;
