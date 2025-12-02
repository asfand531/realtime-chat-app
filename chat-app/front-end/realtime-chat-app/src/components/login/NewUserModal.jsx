import { userFields } from "./userFields";

export default function NewUserModal({
  isOpen,
  setIsOpen,
  handleAddUser,
  handleGetUsers,
}) {
  const styleBtn = {
    background: "#15191e",
  };

  return (
    <>
      <div>
        <dialog open={isOpen} className={`modal ${isOpen ? "" : "hidden"}`}>
          <div className="modal-box">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

            <h3 className="font-bold text-lg mb-4">Add User</h3>
            <form onSubmit={handleAddUser} noValidate>
              {userFields.map((field) => (
                <div key={field.name}>
                  {field.isFileInput ? (
                    <>
                      <fieldset className="fieldset">
                        <input
                          type="file"
                          name={field.name}
                          className="file-input w-full"
                          accept={field.accept}
                          multiple={field.multiple}
                        />
                        <label className="label">{field.label}</label>
                      </fieldset>
                    </>
                  ) : (
                    <>
                      <label className="input validator w-full">
                        {field.icon}
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          pattern={field.pattern}
                          minLength={field.minLength}
                          maxLength={field.maxLength}
                          required
                          className={field.className || ""}
                          title={field.title}
                        />
                      </label>

                      <p className="validator-hint">{field.hint}</p>
                    </>
                  )}
                </div>
              ))}

              <div className="w-full flex justify-center">
                <button
                  className="btn"
                  style={styleBtn}
                  type="submit"
                  onClick={handleGetUsers}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    </>
  );
}
