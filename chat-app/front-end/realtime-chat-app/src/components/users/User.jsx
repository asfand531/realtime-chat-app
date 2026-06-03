import { useState, useEffect, useRef } from "react";
import Searchbar from "../searchBar/Searchbar";
import NewUserModal from "../login/NewUserModal";
import ChatBox from "../chatBox/ChatBox";
import Navbar from "../Navbar/Navbar";
import MessageInput from "../chatBox/MessageInput";
import axios from "axios";
import DefaultScreen from "../default/DefaultScreen";
import { useNavigate } from "react-router-dom";
import { initiateSocket, getSocket, disconnectSocket } from "../../socket";

function User({ search, setSearch, tooltip, handleDrawerClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [activeUserData, setActiveUserData] = useState(null);
  const navigate = useNavigate();

  const selectedUserRef = useRef(null);
  selectedUserRef.current = selectedUser;

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setSelectedUser(null);
    }
  };

  const handleGetUsers = async () => {
    try {
      const res = await axios.get("/api/users", { withCredentials: true });
      return res.data;
    } catch (error) {
      console.error("Error while fetching users!", error);
      return [];
    }
  };

  const handleUserName = async () => {
    try {
      const res = await axios.get("/api/me", { withCredentials: true });
      return res?.data?.user || null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const [currentUser, allUsers] = await Promise.all([
        handleUserName(),
        handleGetUsers(),
      ]);

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setActiveUserData(currentUser);
      setName(currentUser.name);

      setUsers(allUsers.filter((u) => u.id !== currentUser.id));

      const token = localStorage.getItem("token");
      if (token) {
        initiateSocket(token);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!activeUserData) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      const currentConvo = selectedUserRef.current;

      if (
        currentConvo &&
        message.conversationId === currentConvo.conversationId
      ) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m._optimistic &&
              m.senderId === message.senderId &&
              m.content === message.content,
          );
          if (isDuplicate) {
            return prev.map((m) =>
              m._optimistic &&
              m.senderId === message.senderId &&
              m.content === message.content
                ? message
                : m,
            );
          }
          return [...prev, message];
        });
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId !== activeUserData.id) {
        console.log(`User ${userId} is typing:`, isTyping);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [activeUserData]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setUsers((prev) => [...prev, res.data]);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserClick = async (user) => {
    try {
      const res = await axios.post(
        "/api/conversations",
        { userId: user.id },
        { withCredentials: true },
      );
      const convoId = res.data.conversationId;

      const messagesRes = await axios.get(
        `/api/conversations/${convoId}/messages`,
        { withCredentials: true },
      );

      setMessages(messagesRes.data);
      setSelectedUser({ ...user, conversationId: convoId });
    } catch (err) {
      console.error("Error opening conversation:", err);
    }
  };

  const handleLogout = async () => {
    await axios.get("/api/logout", { withCredentials: true });
    localStorage.removeItem("token");
    disconnectSocket();
    navigate("/login");
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input
          id="my-drawer-4"
          type="checkbox"
          className="drawer-toggle"
          defaultChecked={true}
        />

        {selectedUser ? (
          <div
            className={`drawer-content ${selectedUser ? "" : "hidden"}`}
            onClick={handleEsc}
          >
            {/* Navbar */}
            <nav className="navbar w-full bg-base-300 fixed z-10">
              <label
                id="close_icon"
                htmlFor="my-drawer-4"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost tooltip tooltip-right"
                data-tip={`${tooltip} drawer`}
                onClick={handleDrawerClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="my-1.5 inline-block size-4"
                >
                  <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                  <path d="M9 4v16"></path>
                  <path d="M14 10l2 2l-2 2"></path>
                </svg>
              </label>
              <div className="px-4">
                <Navbar
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  handleEsc={handleEsc}
                />
              </div>
            </nav>

            {/* Chats */}
            <div
              className="px-4 pt-18 pb-4 overflow-scroll no-scrollbar flex flex-col-reverse h-[calc(100vh-5rem)]"
              onKeyDown={handleEsc}
            >
              <ChatBox
                messages={messages}
                users={users}
                setUsers={setUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                handleEsc={handleEsc}
                activeUserId={activeUserData?.id}
              />
            </div>

            <hr className="w-full text-gray-600 border" />

            <div
              className="overflow-hidden bottom-0 w-full bg-[#15191e]"
              onKeyDown={handleEsc}
            >
              <MessageInput
                handleEsc={handleEsc}
                messages={messages}
                setMessages={setMessages}
                activeUserData={activeUserData}
                selectedUser={selectedUser}
              />
            </div>
          </div>
        ) : (
          <DefaultScreen />
        )}

        <div className="drawer-side is-drawer-close:overflow-y-visible is-drawer-close:overflow-x-visible">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64 is-drawer-open:p-3">
            <div className="flex justify-center items-center w-full">
              <h2 className="text-2xl font-bold m-2 is-drawer-close:text-xs is-drawer-close:my-5">
                Chats
              </h2>
            </div>

            <Searchbar search={search} setSearch={setSearch} />

            <hr className="w-full text-gray-400 border" />

            {/* Users */}
            <ul className="menu px-0 w-full grow">
              {(search ? filteredUsers : users).map((user, i) => {
                const { name, profileImage } = user;
                return (
                  <li key={i}>
                    <button
                      className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                      data-tip={name}
                      onClick={() => handleUserClick(user)}
                    >
                      <img
                        src={profileImage || "../public/Mens Profile Image.png"}
                        alt={name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="is-drawer-close:hidden">{name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <hr className="w-full text-gray-400 border" />

            <section className="flex is-drawer-open:justify-between is-drawer-close:justify-center items-center w-full px-3 py-5 is-drawer-close:py-6.5">
              <span className="font-bold text-md text-wrap cursor-default is-drawer-close:hidden">
                {name}
              </span>
              <button
                onClick={handleLogout}
                className="tooltip tooltip-top cursor-pointer bg-gray-800 px-2 py-1 rounded"
                data-tip="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#e3e3e3"
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
                </svg>
              </button>
            </section>
          </div>
        </div>
      </div>

      <NewUserModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleAddUser={handleAddUser}
        handleGetUsers={handleGetUsers}
        users={users}
      />
    </>
  );
}

export default User;
