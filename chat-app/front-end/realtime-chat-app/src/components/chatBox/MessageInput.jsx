import { useState } from "react";
import SpeedDial from "./speedDial/SpeedDial";
import { getSocket } from "../../socket";

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

  const handleSendBtn = () => {
    if (!msg.trim() || !selectedUser?.conversationId) return;

    const socket = getSocket();
    if (!socket) return;

    const trimmed = msg.trim();

    socket.emit("send_message", {
      conversationId: selectedUser.conversationId,
      content: trimmed,
      type: "text",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `optimistic_${Date.now()}`,
        senderId: activeUserData.id,
        conversationId: selectedUser.conversationId,
        content: trimmed,
        created_at: new Date().toISOString(),
        _optimistic: true,
      },
    ]);

    setMsg("");
    setIsDisable(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendBtn();
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setMsg(value);
    setIsDisable(value.trim() === "");

    // Emit typing indicator
    const socket = getSocket();
    if (socket && selectedUser?.conversationId) {
      socket.emit("typing", {
        conversationId: selectedUser.conversationId,
        isTyping: value.trim() !== "",
      });
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 w-full overflow-hidden no-scrollbar">
      <SpeedDial />

      <textarea
        rows={1}
        placeholder="Type a message here..."
        className="border px-5 py-3 ml-16 rounded-xl w-svw"
        value={msg}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
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
  );
}

export default MessageInput;
