const backend_base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

//*********** GET REQUESTS ***********//

// get all notes of the current user
export async function getNotes(authToken, userId) {
  console.log(userId);

  const result = await fetch(`${backend_base}/note?userId=${userId}`, {
      'method':'GET',
      headers: {
        'x-api-key': API_KEY,
        Authorization: `Bearer ${authToken}`,
      },
  });

  console.log(JSON.stringify(result));
  return await result.json();
}

// get a specific note by note id
// note id is unique
export async function getNote(authToken, noteId) {
  const result = await fetch(`${backend_base}/note/${noteId}`, {
      'method':'GET',
      headers: {
        'x-api-key': API_KEY,
        Authorization: `Bearer ${authToken}`,
      },
  })
  return await result.json();
}

// get categories of current user
export async function getAllCats(authToken, userId) {
  const response = await fetch(`${backend_base}/categories?userId=${userId}`, {
      method:'GET',
      headers: {
        'x-api-key': API_KEY,
        Authorization: `Bearer ${authToken}`,
      },
  });

  if (!response.ok) {
    console.log("error fetching");
    const errorData = await response.json();
    console.error('Error fetching categories:', errorData);
    throw new Error('Failed to fetch categories');
  }

  return await response.json();
}

// get notes by category
export async function getNotesByCat(authToken, userId, cat) {
  try {
    const response = await fetch(`${backend_base}/note?userId=${userId}&category=${cat}`, 
    {
        method:'GET',
        headers: {
          'x-api-key': API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching todos by category:', errorData);
      throw new Error('Failed to fetch todos by category');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getTodoByCat function:', error);
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
      'x-api-key': API_KEY,
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
      'x-api-key': API_KEY,
      'Content-Type': 'application/json', // Ensure the Content-Type header is set
      Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
    },
    body: JSON.stringify(cat),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error adding new todo:', errorData);
    throw new Error('Failed to adding new todo');
  }

  return await response.json();
}


//*********** DELETE REQUESTS ***********//

// delete an item by _id
export async function deleteNote(authToken, id) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('Note ID is required for updating');
    }
    const response = await fetch(`${backend_base}/note/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': API_KEY,
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
        'x-api-key': API_KEY,
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


//*********** UPDATE REQUESTS ***********//

// update an note's content edit note
export async function updateNote(authToken, userId, id, newCategory, newTitle, newContent) {
  try {
    // Check if the 'id' parameter is defined
    if (!id) {
      throw new Error('Todo ID is required for updating');
    }
    const createdOn = new Date().toISOString(); // Get the current date and time
    const response = await fetch(`${backend_base}/note/${id}`, {
      method: 'PUT',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Add the JWT token to the request header
      },
      body: JSON.stringify({
        userId: userId,
        title: newTitle,
        content: newContent,
        category: newCategory,
        createdOn: createdOn,
      }),
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