const backend_base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

//*********** GET REQUESTS ***********//

// get all notes of the current user
export async function getNotes(authToken) {
  console.log(authToken);
  const result = await fetch(`${backend_base}/note`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  
  // console.log(JSON.stringify(result));
  return result.json();
}

// get notes by asecding order, userId will be extracted from the token
export async function getNotesAsce(authToken, userId) {
  // console.log(userId);

  const result = await fetch(`${backend_base}/note/sortByDesc/false`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  console.log(JSON.stringify(result));
  return await result.json();
}

// get notes by desecding order, userId will be extracted from the token
export async function getNotesDesc(authToken, userId) {
  // console.log(userId);

  const result = await fetch(`${backend_base}/note/sortByDesc/true`, {
    method: 'GET',
    headers: {
      // 'x-api-key': API_KEY,
      Authorization: `Bearer ${authToken}`,
    },
  });

  console.log(JSON.stringify(result));
  return await result.json();
}

// get a specific note by note id
// note id is unique
export async function getNote(authToken, noteId) {
  console.log('note id is', noteId);
  const result = await fetch(`${backend_base}/note/${noteId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return await result.json();
}

// get categories of current user
export async function getAllCats(authToken) {
  const response = await fetch(`${backend_base}/categories`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    console.log('error fetching');
    const errorData = await response.json();
    console.error('Error fetching categories:', errorData);
    throw new Error('Failed to fetch categories');
  }

  const categoriesData = await response.json();
  console.log('Categories data:', categoriesData); // Log categories data for debugging
  return categoriesData;
}

// get notes by category
export async function getNotesByCat(authToken, cat) {
  try {
    const response = await fetch(`${backend_base}/note/category/${cat}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching notes by category:', errorData);
      throw new Error('Failed to fetch notes by category');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getNotesByCat function:', error);
    throw error;
  }
}

// get search results
// userId will be extracted from token
export async function getSearchRes(authToken, searchInput) {
  try {
    const response = await fetch(
      `${backend_base}/note/getAllSearchNotes/${searchInput}`,
      {
        method: 'GET',
        headers: {
          // 'x-api-key': API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching notes for search:', errorData);
      throw new Error('Failed to fetch notes for search');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getSearchRes function:', error);
    throw error;
  }
}

//*********** POST REQUESTS ***********//

// add a new note
// new note should have the complete json fields, e.g.
// {
//   "userId": "test1",
//   "title": "new title for Note 1",
//   "content": "new content for note 111",
//   "category": "health"
// }
export async function addNote(authToken, newNote) {
  const response = await fetch(`${backend_base}/note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Ensure the Content-Type header is set
      Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
    },
    body: JSON.stringify(newNote),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error adding new newNote:', errorData);
    throw new Error('Failed to adding new newNote');
  }

  return await response.json();
}

// add a new category
export async function addCat(authToken, cat) {
  const response = await fetch(`${backend_base}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Ensure the Content-Type header is set
      Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
    },
    body: JSON.stringify(cat),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error adding new category:', errorData);
    throw new Error('Failed to adding new category');
  }

  return await response.json();
}
//*********** DELETE REQUESTS ***********//

// delete a note by _id
export async function deleteNote(authToken, id) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('Note ID is required for updating');
    }
    const response = await fetch(`${backend_base}/note/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
      },
    });

    // Check if the response status code indicates success
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting note:', errorData);
      throw new Error('Failed to delete note');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteNote function:', error);
    throw error;
  }
}

// delete an category by _id
export async function deleteCat(authToken, id) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('category ID is required for deleting');
    }
    const response = await fetch(`${backend_base}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        // 'x-api-key': API_KEY,
        Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
      },
    });

    // Check if the response status code indicates success
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting category:', errorData);
      throw new Error('Failed to delete category');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in deleteNote function:', error);
    throw error;
  }
}

//*********** UPDATE REQUESTS ***********//

// update an note's content edit note by note _id
// {
//   "category": "health",
//   "content": "new content for note 2",
//   "title": "updated local note 2",
//   "userId": "user_2OXeugjSSeqp4tDieMufwv8kUGO"
// }
export async function updateNote(authToken, id, modifiedNote) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('Note ID is required for updating');
    }
    const createdOn = new Date().toISOString(); // Get the current date and time
    const response = await fetch(`${backend_base}/note/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
      },
      body: JSON.stringify(modifiedNote),
    });

    // Check if the response status code indicates success
    if (!response.ok) {
      // Check if the response has a JSON body
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      console.error('Error updating note:', errorData);
      throw new Error('Failed to update note');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateNote function:', error);
    throw error;
  }
}


// update a category's name, edit category by _id
// {
//   "name": "health",
//   "userId": ""
// }
export async function updateCat(authToken, id, modifiedCat) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('Category ID is required for updating');
    }
    const createdOn = new Date().toISOString(); // Get the current date and time
    const response = await fetch(`${backend_base}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
      },
      body: JSON.stringify(modifiedCat),
    });

    // Check if the response status code indicates success
    if (!response.ok) {
      // Check if the response has a JSON body
      const contentType = response.headers.get('content-type');
      let errorData;
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      console.error('Error updating category:', errorData);
      throw new Error('Failed to update category');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateCat function:', error);
    throw error;
  }
}

// schedule a new reminder
export async function scheduleReminder(authToken, reminder) {
  const result = await fetch(`${backend_base}/reminder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(reminder),
  });

  return result.json();
}

// get all reminders of the current user
export async function getReminders(authToken) {
  const result = await fetch(`${backend_base}/reminder`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return result.json();
}

//delete a reminder
export async function deleteReminder(authToken, reminderId) {
  const result = await fetch(`${backend_base}/reminder/${reminderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  return result.json();
}