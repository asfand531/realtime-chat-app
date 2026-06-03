import { useState, useEffect, useRef, Fragment } from "react";
import formatChatTimestamp from "./formatChatTimestamp";
import formatDateForSeparator from "./formatDateForSeperator";

function ChatBox({
  messages,
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  handleEsc,
  activeUserId,
}) {
  let lastDate = null;

  useEffect(() => {
    console.log("MESSAGES:", messages);
  }, [messages]);

  return (
    <>
      {selectedUser ? (
        <div>
          {messages.map((m) => {
            const { id, content, senderId, created_at } = m;

            const isMine = senderId === activeUserId;

            const msgDate = formatDateForSeparator(created_at);
            const showSeparator = msgDate !== lastDate;
            lastDate = msgDate;

            const formattedTime = formatChatTimestamp(created_at);

            return (
              <Fragment key={id}>
                {showSeparator && (
                  <div className="text-center my-3 font-bold flex justify-center sticky top-0">
                    <span className="bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded-full">
                      {msgDate}
                    </span>
                  </div>
                )}

                <div
                  className={`chat my-3 ${isMine ? "chat-end" : "chat-start"}`}
                >
                  {!isMine && (
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          src={
                            selectedUser.profileImage ||
                            "/Mens Profile Image.png"
                          }
                          alt={selectedUser.name}
                        />
                      </div>
                    </div>
                  )}

                  <div className="chat-header">
                    {isMine ? "You" : selectedUser.name}
                    <time className="text-xs opacity-50 ml-2">
                      {formattedTime}
                    </time>
                  </div>

                  <div
                    className={`chat-bubble ${
                      isMine
                        ? "chat-bubble-info max-w-[45%]"
                        : "chat-bubble-primary max-w-[50%]"
                    }`}
                  >
                    {content}
                  </div>

                  <div className="chat-footer opacity-50">
                    {isMine ? "Seen" : "Delivered"}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export default ChatBox;
