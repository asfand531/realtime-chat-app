function Navbar({ selectedUser, setSelectedUser, handleEsc }) {
  return (
    <>
      {selectedUser ? (
        <div
          className="font-bold cursor-pointer flex justify-center items-center gap-6"
          tabIndex={0}
          onKeyDown={handleEsc}
        >
          <img
            src={
              selectedUser.profileImage || "../public/Mens Profile Image.png"
            }
            alt={selectedUser.name}
            className="w-6"
          />
          <h2>{selectedUser.name}</h2>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default Navbar;
