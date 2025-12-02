import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/v1/api/message")
      .then((res) => res.data)
      .then((data) => {
        setMessage(data.message);
        console.log("Your data: ", data);
      })
      .catch((err) => console.error("Error: ", err));
  }, []);

  const handleAge = (e) => {
    const newDob = e.target.value;
    setDob(newDob);
    calculateAge(newDob);
  };

  const calculateAge = (birthdateString) => {
    if (!birthdateString) {
      setAge("");
      return;
    }

    const birthDate = new Date(birthdateString);
    const today = new Date();

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    setAge(calculatedAge);
  };

  if (age < 0) {
    setAge(0);
    alert("Age must be greater than 0");
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const getAll = formdata.entries().reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {});
    axios
      .post("http://localhost:5000/table", getAll)
      .then((res) => console.log(res))
      .catch((err) => console.error("Error: ", err));
  };

  return (
    <>
      <div>
        <h1>React - Express</h1>
        <p>Backend says: {message}</p>
        <br />
        <form onSubmit={handleOnSubmit}>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your name"
            title="Name"
            className="input"
            required={true}
          />
          <label htmlFor="dob">DOB: </label>
          <input
            type="date"
            id="dob"
            name="dob"
            onChange={handleAge}
            value={dob}
            title="Date of Birth"
            className="input"
            required={true}
          />
          <label htmlFor="age">Age: </label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Your age"
            value={age}
            readOnly
            title="Age (read-only)"
            className="input"
            required={true}
          />
          <label htmlFor="imgFile">Upload image: </label>
          <input
            type="file"
            id="imgFile"
            accept="image/*"
            name="file"
            className="input"
          />
          <br />
          <button type="submit">Send file</button>
        </form>
      </div>
    </>
  );
}

export default App;
