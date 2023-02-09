import {
  Facebook,
  Instagram,
  MailOutline,
  Phone,
  Pinterest,
  Room,
  Twitter,
} from "@material-ui/icons";
import styled from "styled-components";
import { mobile } from "../../responsive";
import logo from "../assets/images/firstimp.png";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  background-color: #030205;
  background-image: url("https://www.transparenttextures.com/patterns/black-linen-2.png");
  /* This is mostly intended for prototyping; please download the pattern and re-host for production environments. Thank you! */
  color: white;
  ${mobile({ flexDirection: "column" })}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Logo = styled.h1`
  font-family: "Mistral Regular";
  font-weight: 400;
  font-size: 35px;
  color: rgb(255, 20, 147);
`;

const Desc = styled.p`
  margin: 20px 0px;
`;

const SocialContainer = styled.div`
  display: flex;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  background-color: #${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const Center = styled.div`
  flex: 1;
  padding: 20px;
  ${mobile({ display: "none" })}
`;

const Title = styled.h3`
  margin-bottom: 30px;
  color: white;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
`;

const ListItem = styled.li`
  width: 50%;
  margin-bottom: 10px;
  text-decoration: none;
`;

const Right = styled.div`
  flex: 1;
  padding: 20px;
`;

const ContactItem = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;

const Payment = styled.img`
  width: 50%;
`;

const Footer = () => {
  return (
    <Container>
      <Left>
        {/* <img src= {logo} alt="logo" /> */}
        <Logo>First Impression Furnishing LLP</Logo>
        <Desc></Desc>
      </Left>
      <Center>
        <Title>Useful Links</Title>
        <List>
          <ListItem>
            <Link to="/">Home</Link>
          </ListItem>
          <ListItem>
            <Link to="/cart">Cart</Link>
          </ListItem>

          <ListItem>
            <Link to="/user/history">My Account</Link>
          </ListItem>
          <ListItem>
            <Link to="/user/history">Tracking</Link>
          </ListItem>
          <ListItem>
            <Link to="/user/wishlist">Wishlist</Link>
          </ListItem>
          <ListItem>
            <Link to="/cart">Order</Link>
          </ListItem>
          <ListItem>
            <Link to="/terms-and-condition">Terms and Condition</Link>
          </ListItem>
          <ListItem>
            <Link to="/contact">Contact</Link>
          </ListItem>
        </List>
      </Center>
      <Right>
        <Title>Contact</Title>
        <ContactItem>
          <Room style={{ marginRight: "10px" }} /> First Impression 8-11, Om
          Chambers, Ground floor, Kemps Corner, Mumbai - 400036
        </ContactItem>
        <ContactItem>
          <Phone style={{ marginRight: "10px" }} /> 7777045811, +91-22-66642030,
          +91-22-66642031,
        </ContactItem>
        <ContactItem>
          <MailOutline style={{ marginRight: "10px" }} /> meher@firstimp.in,
          firstimp777@gmail.com
        </ContactItem>
        <Payment src="https://i.ibb.co/Qfvn4z6/payment.png" />
      </Right>
    </Container>
  );
};

export default Footer;
