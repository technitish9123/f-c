import axios from "axios";

const API = import.meta.env.REACT_APP_API;

// Public: sample request, enquiry, visit booking or back-in-stock request.
export const createLead = (lead) => axios.post(`${API}/leads`, lead);

export const getLeads = (authtoken) => axios.get(`${API}/admin/leads`, { headers: { authtoken } });
export const updateLead = (authtoken, id, patch) => axios.put(`${API}/admin/leads/${id}`, patch, { headers: { authtoken } });

// The server's message for a rejected form, or a generic one.
export const leadError = (err) => err.response?.data?.err || (err.response?.status === 429
  ? "Too many requests from this device. Please try again in a few minutes."
  : "Something went wrong. Please try again, or call 7777045811.");
