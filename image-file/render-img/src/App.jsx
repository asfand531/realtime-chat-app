import Register from "../components/Register";
import { useState } from "react";
import axios from "axios";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../components/Login";

function App() {
  const [uploadImage, setUploadImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    setUploadImage(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadImage) return console.log("No image has been uploaded!");

    const formData = new FormData();
    formData.append("file", uploadImage);
    console.log("Upload image: ", uploadImage);

    try {
      await axios.post("http://localhost:2030/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // "Content-Type": "images/*",
        },
      });
      console.log("Image uploaded successfully!");
      setUploadImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
      {/* <div className="img">
        <img
          src={preview}
          alt={uploadImage?.name}
          className="img"
          id="imgContent"
        />
      </div>
      <form action={"/upload"} onSubmit={(e) => e.preventDefault()}>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/*"
          onChange={handleFile}
        />
        <button onClick={handleUpload}>Upload</button>
      </form> */}
    </>
  );
}

export default App;
