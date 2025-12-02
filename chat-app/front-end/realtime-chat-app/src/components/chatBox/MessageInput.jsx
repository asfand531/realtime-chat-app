import SpeedDial from "./speedDial/SpeedDial";

function MessageInput() {
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

  return (
    <div className="flex items-center gap-3 px-4 py-3 w-full overflow-hidden no-scrollbar">
      <SpeedDial />

      <textarea
        rows={1}
        type="text"
        placeholder="Type a message here..."
        className="border px-5 py-3 ml-16 rounded-xl w-svw"
      />

      <button
        className="cursor-pointer border px-3 py-3 rounded-4xl tooltip tooltip-left"
        data-tip="Send message"
      >
        {sendBtn}
      </button>
    </div>
  );
}

export default MessageInput;
