import React from "react";
import StarRating from "react-star-ratings";

const Star = ({starClick, numberOfStars}) => 
<>
    <StarRating 
        changeRating={() => starClick(numberOfStars)}
        numberOfStars={numberOfStars}
        starDimension="13px"
        starSpacing="2px"
        starHoverColor="#1c1b19"
        starEmptyColor="#8b847a"
    />
    <br />
</>


export default Star;