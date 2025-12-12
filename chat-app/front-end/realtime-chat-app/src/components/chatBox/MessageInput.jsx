import { useEffect, useState } from "react";
import SpeedDial from "./speedDial/SpeedDial";
import axios from "axios";

function MessageInput({ selectedUser, activeUserData, messages, setMessages }) {
  const [msg, setMsg] = useState("");
  const [isDisable, setIsDisable] = useState(true);

  const sendBtn = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="white"
    >
      <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
    </svg>
  );

  const handleSendBtn = async () => {
    if (!msg.trim()) return;

    setIsDisable(msg.trim() === "");

    const res = await axios.post("/api/messages", {
      senderId: activeUserData.id,
      receiverId: selectedUser.id,
      message: msg,
      type: "text",
    });

    setMessages((prev) => [...prev, res.data.result]);

    setMsg("");
    setIsDisable(true);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setMsg(value);
    setIsDisable(value.trim() === "");
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 w-full overflow-hidden no-scrollbar">
        <SpeedDial />

        <textarea
          rows={1}
          placeholder="Type a message here..."
          className="border px-5 py-3 ml-16 rounded-xl w-svw"
          value={msg}
          onChange={handleInput}
        />

        <button
          className={`border px-3 py-3 rounded-4xl tooltip tooltip-left ${
            isDisable
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100 cursor-pointer"
          }`}
          data-tip={isDisable ? "" : "Send message"}
          onClick={handleSendBtn}
          disabled={isDisable}
        >
          {sendBtn}
        </button>
      </div>
    </>
  );
}

export default MessageInput;
