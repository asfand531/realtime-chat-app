import { useState, useEffect } from "react";
import Searchbar from "../searchBar/Searchbar";
import NewUserModal from "../login/NewUserModal";
import ChatBox from "../chatBox/ChatBox";
import Navbar from "../Navbar/Navbar";
import MessageInput from "../chatBox/MessageInput";
import axios from "axios";
import DefaultScreen from "../default/DefaultScreen";
import { useNavigate } from "react-router-dom";

function User({
  search,
  setSearch,
  tooltip,
  handleDrawerClick,
  loginUserData,
  sentMsg,
  setSentMsg,
  handleSentMsg,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  const filteredUsers = users.filter((user) => {
    return user.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setSelectedUser(null);
    }
  };

  const handleGetUsers = async () => {
    try {
      const res = await axios.get("/api/users", { withCredentials: true });
      setUsers(res.data);
    } catch (error) {
      console.error("Error while rendering users!", error);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      await handleGetUsers();
    };

    loadUsers();

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    let userObj = Object.fromEntries(formData.entries());
    console.log("User Object:", userObj);

    // Upload to backend
    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add new user to UI
      setUsers((prev) => [...prev, res.data]);

      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserClick = async (users) => {
    setSelectedUser(users.id);

    try {
      const res = await axios.get("/api/messages/${user.id}");
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await axios.get("/api/logout");
    navigate("/login");
    return;
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
            <nav className="navbar w-full bg-base-300 fixed">
              <label
                id="close_icon"
                htmlFor="my-drawer-4"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost tooltip tooltip-right"
                data-tip={`${tooltip} drawer`}
                onClick={handleDrawerClick}
              >
                {/* Sidebar toggle icon */}
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
              className="p-4 overflow-scroll no-scrollbar flex flex-col-reverse h-[calc(100vh-5rem)]"
              onKeyDown={handleEsc}
            >
              <ChatBox
                messages={messages}
                users={users}
                setUsers={setUsers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                handleEsc={handleEsc}
                handleUserClick={handleUserClick}
                sentMsg={sentMsg}
              />
            </div>

            <hr className="w-full text-gray-600 border" />

            <div
              className="overflow-hidden bottom-0 w-full bg-[#15191e]"
              onKeyDown={handleEsc}
            >
              <MessageInput
                handleEsc={handleEsc}
                sentMsg={sentMsg}
                setSentMsg={setSentMsg}
                handleSentMsg={handleSentMsg}
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
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-bold m-2 is-drawer-close:hidden">
                Chats
              </h2>

              <div
                className="is-drawer-close:p-4 is-drawer-close:m-0 tooltip is-drawer-close:tooltip-right is-drawer-open:tooltip-left is-drawer-close:hover:bg-[#2e343b] is-drawer-close:hover:cursor-pointer"
                data-tip="Add User"
                onClick={() => setIsOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="white"
                  className="cursor-pointer"
                >
                  <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                </svg>
              </div>
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
                      onClick={() => setSelectedUser(user)}
                    >
                      <img
                        src={profileImage}
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
                {loginUserData}
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
