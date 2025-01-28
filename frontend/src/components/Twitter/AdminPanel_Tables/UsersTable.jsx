import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { fetchUsers, removeUser, postUser } from "../../../services/twitterApi";
import moment from "moment";

const convertTimestampToDate = (ts) => moment(ts).format("LLL");

function TwitterAdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInput, setNewInput] = useState("");

  // Fetch users - filters can be added here
  useEffect(() => {
    setLoading(true); // Start loading
    fetchUsers()
      .then((monitored_users) => {
        setUsers(monitored_users);
      })
      .finally(() => {
        setLoading(false); // End loading
      });
  }, []);

  const handleDelete = (username) => {
    setUsers(users.filter((user) => user.username !== username));
    setShowDeleteConfirm(null);
    removeUser(username);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setShowAddForm(false);
    if (newInput) {
      postUser(newInput).then((result) => {
        setUsers([
          ...users,
          { username: result.username, last_scan: "Not scanned yet" },
        ]);
        setNewInput("");
      });
    }
  };

  return (
    <div className="admin-panel">
      {loading ? (
        <div className="spinner-container-center">
          <ClipLoader color="#3b82f6" loading={true} size={50} />
        </div>
      ) : (
        <>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Last Scan</th>
                  <th>
                    <button
                      className="add-user-btn"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus size={20} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>
                      {typeof user.last_scan === "number"
                        ? convertTimestampToDate(user.last_scan * 1000)
                        : user.last_scan}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => setShowDeleteConfirm(user.username)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDeleteConfirm && (
            <div className="modal" onClick={() => setShowDeleteConfirm(null)}>
              <div className="modal-content">
                <h3>Are you sure?</h3>
                <p>
                  Do you want to delete <strong>{showDeleteConfirm}</strong>?
                </p>
                <div className="modal-actions">
                  <button onClick={() => handleDelete(showDeleteConfirm)}>
                    Yes
                  </button>
                  <button onClick={() => setShowDeleteConfirm(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add New User</h3>
                <form onSubmit={handleAddUser}>
                  <input
                    type="text"
                    placeholder="Enter Twitter @username"
                    value={`${newInput}`}
                    onChange={(e) => setNewInput(`${e.target.value}`)}
                    required
                  />
                  <div className="modal-actions">
                    <button type="submit">Add</button>
                    <button type="button" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TwitterAdminPanel;
