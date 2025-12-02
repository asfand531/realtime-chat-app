import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // const [message, setMessage] = useState([]);
  // const [editText, setEditText] = useState("");
  // const [selectedId, setSelectedId] = useState(null);

  const [message, setMessage] = useState([]);
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const deleted = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="white"
      className="del_icon"
    >
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
    </svg>
  );

  const edit = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="white"
      className="edit_icon"
    >
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
    </svg>
  );

  useEffect(() => {
    axios
      .get("http://localhost:8052/messages")
      .then((res) => {
        console.log(res.data);
        res.data.map((item) => {
          console.log("Text: ", item.text);
          return <p>{item.text}</p>;
        });
        setMessage(res.data);
      })
      .catch((err) => console.error("Error: ", err));
  }, []);

  // const handleInsert = () => {
  //   const signal = new AbortController();
  //   axios
  //     .post("http://localhost:8052/send-message", message, {
  //       headers: {
  //         "Content-Type": "text/plain",
  //       },
  //       signal: signal.signal,
  //     })
  //     .then((res) => console.log(res))
  //     .catch((err) => console.error("Error: ", err));
  // };

  const handleInsert = () => {
    axios
      .post("http://localhost:8052/send-message", { text })
      .then((res) => {
        setMessage([...message, res.data]);
        setText("");
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8052/messages/${id}`)
      .then(() => {
        setMessage((prev) => prev.filter((m) => m.id !== id));
        console.log(`Item with the ID # ${id} has been deleted successfully!`);
      })
      .catch((err) => console.error(`Error deleting the item ${err}`));
  };

  // const handleUpdate = (id, newText) => {
  //   axios
  //     .put(`http://localhost:8052/messages/${id}, ${{ text: newText }}`)
  //     .then((res) => {
  //       console.log(`Item with the ${res.data} has been updated successfully!`);

  //       setMessage((prev) => {
  //         prev.map((m) => {
  //           m.id === selectedId ? { ...m, text: editText } : m;
  //         });
  //       });
  //       setSelectedId(null);
  //       setEditText("");
  //     })
  //     .catch((err) => console.error(`Error updating the item ${err}`));
  // };

  const handleUpdate = () => {
    axios
      .put(`http://localhost:8052/messages/${selectedId}`, { text })
      .then(() => {
        setMessage((prev) =>
          prev.map((m) => (m.id === selectedId ? { ...m, text } : m))
        );
        setSelectedId(null);
        setText("");
      })
      .catch((err) => console.error(err));
  };

  const handleEdit = (id) => {
    const selectedMessage = message.find((m) => m.id === id);
    setSelectedId(id);
    setText(selectedMessage.text);
  };

  return (
    <>
      <div className="container-display">
        <label htmlFor="message">Message: </label>
        <textarea
          name="message"
          id="message"
          cols="50"
          rows="5"
          placeholder="Your message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={selectedId ? handleUpdate : handleInsert}>
          {selectedId ? "Update" : "Insert"}
        </button>
      </div>

      <h2>Table</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Text</th>
            <th>Created Date & Time</th>
            <th colSpan={2}>Actions</th>
          </tr>
        </thead>
        {message.map((m) => {
          const { id, text, created_at } = m;
          return (
            <tbody key={id}>
              <tr>
                <td>{id}</td>
                <td>{text}</td>
                <td>{created_at}</td>
                <td onClick={() => handleEdit(id)}>{edit}</td>
                <td onClick={() => handleDelete(id)}>{deleted}</td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </>
  );
}

export default App;
