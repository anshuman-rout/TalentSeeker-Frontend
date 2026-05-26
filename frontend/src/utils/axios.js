import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.7.12:8001",
});

export default API;