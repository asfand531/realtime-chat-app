function ChatBox({
  messages,
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  handleEsc,
  sentMsg,
}) {

  
  return (
    <>
      {selectedUser ? (
        <div>
          {/* Receiver */}
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img alt={selectedUser.name} src={selectedUser.profileImage} />
              </div>
            </div>
            <div className="chat-header">
              {selectedUser.name}
              <time className="text-xs opacity-50">12:45</time>
            </div>
            <div className="chat-bubble chat-bubble-primary">Reciever</div>
            <div className="chat-footer opacity-50">Delivered</div>
          </div>

          {/* Myself */}
          <div className="chat chat-end">
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
              <time className="text-xs opacity-50">12:46</time>
            </div>
            <div className="chat-bubble chat-bubble-info">{sentMsg}</div>
            <div className="chat-footer opacity-50">Seen at 12:46</div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default ChatBox;
