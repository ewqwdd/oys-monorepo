import { Route, Routes } from "react-router";
import Login from "../pages/Login/Login";
import Home from "../pages/Home/Home";
import Teachers from "../pages/Teachers/Teachers";
import Meets from "../pages/Meets/Meets";
import Clients from "../pages/Clients/Clients";
import Photos from "../pages/Photos/Photos";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/meets" element={<Meets />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/photos" element={<Photos />} />
    </Routes>
  );
}
