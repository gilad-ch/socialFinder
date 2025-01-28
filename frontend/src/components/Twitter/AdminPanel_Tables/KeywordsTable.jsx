import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import {
  fetchKeywords,
  deleteKeyword,
  postKeyword,
} from "../../../services/twitterApi";
import moment from "moment";

const convertTimestampToDate = (ts) => moment(ts).format("LLL");

function TwitterAdminPanel() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInput, setNewInput] = useState("");

  // Fetch users - filters can be added here
  useEffect(() => {
    setLoading(true); // Start loading
    fetchKeywords()
      .then((keywords) => {
        setKeywords(keywords);
      })
      .finally(() => {
        setLoading(false); // End loading
      });
  }, []);

  const handleDelete = (_id) => {
    setKeywords(keywords.filter((keyword) => keyword._id !== _id));
    setShowDeleteConfirm(null);
    deleteKeyword(_id);
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    setShowAddForm(false);
    if (newInput) {
      postKeyword(newInput).then((result) => {
        setKeywords([
          ...keywords,
          {
            _id: result._id,
            keyword: result.keyword,
            last_scan: "Not scanned yet",
          },
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
                  <th>Keyword</th>
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
                {keywords.map((keyword) => (
                  <tr key={keyword._id}>
                    <td>{keyword.keyword}</td>
                    <td>
                      {typeof keyword.last_scan === "number"
                        ? convertTimestampToDate(keyword.last_scan * 1000)
                        : keyword.last_scan}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => setShowDeleteConfirm(keyword._id)}
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
                <p>Do you want to delete the keyword?</p>
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
                <h3>Add New Keyword</h3>
                <form onSubmit={handleAddKeyword}>
                  <input
                    type="text"
                    placeholder="Enter Search Keyword"
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
