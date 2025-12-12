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
}) {
  let lastDate = null;

  return (
    <>
      {selectedUser ? (
        <div>
          {/* Receiver */}
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  alt={selectedUser.name}
                  src={selectedUser.profileImage || "/Mens Profile Image.png"}
                />
              </div>
            </div>
            <div className="chat-header">
              {selectedUser.name}
              <time className="text-xs opacity-50">12:45</time>
            </div>
            <div className="chat-bubble chat-bubble-primary max-w-[calc(50%)]">
              Reciever
            </div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>

          {/* Myself */}

          {messages.map((m) => {
            const {
              id,
              message,
              receiverId,
              senderId,
              type,
              created_at,
              seen_at,
            } = m;

            const msgDate = formatDateForSeparator(created_at);
            const showSeparator = msgDate !== lastDate;
            lastDate = msgDate;

            const formattedTime = formatChatTimestamp(created_at);

            return (
              <Fragment key={id}>
                {/* Date Seperator */}
                {showSeparator && (
                  <div className="text-center my-3 font-bold flex justify-center sticky top-0">
                    <span className="bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded-full">
                      {msgDate}
                    </span>
                  </div>
                )}

                {/* Chat Bubble */}
                <div className="chat chat-end my-3">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    You
                    <time className="text-xs opacity-50">{formattedTime}</time>
                  </div>
                  <div className="chat-bubble chat-bubble-info max-w-[calc(45%)]">
                    {message}
                  </div>
                  <time className="chat-footer opacity-50">Seen at </time>
                </div>
              </Fragment>
            );
          })}
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default ChatBox;
