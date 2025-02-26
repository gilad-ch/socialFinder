// ---------------- Admin Pannel - Users ----------------

export async function fetchUsers() {
  try {
    const response = await fetch("/api/twitter/monitored_users");
    return await response.json();
  } catch (error) {
    console.error("fetch twitter users error: ", error);
    return [];
  }
}

export async function removeUser(username) {
  try {
    const response = await fetch("/api/twitter/remove_user/" + username);
    return await response.json();
  } catch (error) {
    console.error(`remove ${username} error: `, error);
  }
}

export async function postUser(username) {
  return fetch(`/api/twitter/add_user/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        // If the response is not OK, throw the response to be handled in the next .then() or .catch()
        return response.json().then((errorMessage) => {
          throw { status: response.status, message: errorMessage.detail };
        });
      }
      // If the response is OK, return the parsed JSON
      return response.json();
    })
    .catch((error) => {
      if (error.status === 400) {
        alert(error.message || "Incorrect username format. Please try again.");
      } else if (error.status === 409) {
        alert(
          error.message ||
            "User already exists. Please choose a different username."
        );
      } else {
        console.error("Error adding user:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    });
}

// ---------------- Admin Pannel - Keywords ----------------

export function fetchGroups() {
  return [
    {
      _id: "67b9eca20ac78fea80f8467b",
      name: "General",
      keywords: [
        {
          _id: "67b9c4f7905f797a8adfaa80",
          keyword: "משרות הייטק",
          last_scan: 1740231570.1574519,
        },
        {
          _id: "67b9c4f7905f797a8adfaa99",
          keyword: "אפיפון",
          last_scan: 1740231570.1574519,
        },
      ],
    },
    {
      _id: "63b9eca20ac78fea80f84622",
      name: "קשר",
      keywords: [
        {
          _id: "32b9c4f7905f797a8adfaa80",
          keyword: "מכשיר קשר",
          last_scan: 1740231570.1574519,
        },
        {
          _id: "32b9c4f7905f797a8adfaa99",
          keyword: "ווקי טוקי",
          last_scan: 1740231570.1574519,
        },
        {
          _id: "31b9c4f7905f797a8adfaa99",
          keyword: " מדונה",
          last_scan: 1740231570.1574519,
        },
      ],
    },
    {
      _id: "63b9eca20ac78fea80f84622",
      name: 'אמל"ח',
      keywords: [
        {
          _id: "32b9c4f7905f797a8adfaa80",
          keyword: "טנק ",
          last_scan: 1740231570.1574519,
        },
        {
          _id: "32b9c4f7905f797a8adfaa99",
          keyword: "M16",
          last_scan: 1740231570.1574519,
        },
        {
          _id: "31b9c4f7905f797a8adfaa99",
          keyword: " מרכבה",
          last_scan: 1740231570.1574519,
        },
      ],
    },
  ];
}

export async function fetchKeywords() {
  try {
    const response = await fetch("/api/twitter/keywords");
    return await response.json();
  } catch (error) {
    console.error("fetch twitter users error: ", error);
    return [];
  }
}

export async function postKeyword(keyword) {
  return fetch(`/api/twitter/add_keyword/${keyword}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        // If the response is not OK, throw the response to be handled in the next .then() or .catch()
        return response.json().then((errorMessage) => {
          throw { status: response.status, message: errorMessage.detail };
        });
      }
      // If the response is OK, return the parsed JSON
      return response.json();
    })
    .catch((error) => {
      if (error.status === 400) {
        alert(error.message || "Incorrect keyword format. Please try again.");
      } else if (error.status === 409) {
        alert(
          error.message ||
            "Keyword already exists. Please choose a different keyword."
        );
      } else {
        console.error("Error adding Keyword:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    });
}

export async function deleteKeyword(_id) {
  try {
    const response = await fetch(`/api/twitter/delete_keyword/${_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete the keyword.");
    }

    const data = await response.json();
    return data; // Success response
  } catch (error) {
    console.error("Error deleting keyword:", error);
    alert(error.message || "An unexpected error occurred. Please try again.");
    throw error; // Rethrow the error if needed by calling code
  }
}

// ---------------- Twitts ----------------

export async function fetchTwitts(
  status = 0,
  cursor = null,
  keywords = null,
  username = null,
  search = null
) {
  try {
    // Build the base URL with the status and cursor parameters
    let url = `/api/twitter/tweets?status=${status}${
      cursor ? `&cursor=${cursor}` : ""
    }`;

    // Add keywords to the URL if provided
    if (keywords && keywords.length > 0) {
      keywords.forEach((kw) => {
        url += `&keyword=${encodeURIComponent(kw)}`;
      });
    }

    // Add user_id to the URL if provided
    if (username) {
      url += `&username=${username}`;
    }

    // Add search to the URL if provided (this is for case-insensitive search)
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // Fetch the response from the API
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function deleteTweet(object_id) {
  try {
    const response = await fetch("/api/twitter/approve/" + object_id);
    return await response.json();
  } catch (error) {
    console.error(`approve tweet ${object_id} error: `, error);
  }
}

export async function bulkDeleteTweets(object_id_list) {
  const body = JSON.stringify(object_id_list);

  try {
    const response = await fetch(`/api/twitter/bulk_delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    return await response.json();
  } catch (error) {
    console.error(`bulk delete error: `, error);
  }
}

export async function updateTweetStatus(tweet_id, status) {
  try {
    const response = await fetch(
      `/api/twitter/update_tweet_status/${tweet_id}?status=${status}`,
      {
        method: "POST", // Change to POST
        headers: {
          "Content-Type": "application/json", // Ensure the content type is set to JSON
        },
        body: JSON.stringify({ status }), // Send the status in the body as JSON
      }
    );

    // Return the response as JSON
    return await response.json();
  } catch (error) {
    console.error(`Error updating tweet ${tweet_id}: `, error);
  }
}
