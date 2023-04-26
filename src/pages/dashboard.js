import React, { useEffect, useState, useRef, useContext } from 'react';
import Link from 'next/link';
import styles from '../styles/dashboard.module.css';
import { ThemeContext } from './_app';
import { useClerk } from '@clerk/clerk-react';
import { useAuth, useUser, UserButton, SignIn } from '@clerk/nextjs';
import {
  Container,
  Navbar,
  Button,
  Modal,
  ListGroup,
  Form,
  Offcanvas,
  Dropdown,
} from 'react-bootstrap';

import {
  BsList,
  BsSearch,
  BsFilter,
  BsSortAlphaDown,
  BsSortAlphaDownAlt,
  BsPlus,
  BsMoon,
  BsBoxArrowRight,
  BsX,
  BsSun,
  BsMoonStars,
} from 'react-icons/bs';
// ...

import {
  RiSortAsc,
  RiSortDesc,
} from "react-icons/ri";

import {
  getNotes,
  deleteNote,
  getAllCats,
  addCat,
  getNotesByCat,
} from '@/modules/Data.js';
import {
  addNote,
  updateNote,
  deleteCat,
  getNotesDesc,
  getNotesAsce,
  getSearchRes,
} from '@/modules/Data.js';

import {
  getReminders,
  deleteReminder,
  scheduleReminder,
} from '@/modules/Data.js';

import { generatePdfHTML } from '@/modules/GeneratePDF.js';

//import Calendar from "@/components/Calendar";
import Time from "@/components/Time";
import { NotificationManager } from 'react-notifications';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { InvalidTokenError } from 'jwt-decode';


const Dashboard = () => {
  const { signOut } = useClerk();
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  // Add state to manage the visibility of the move category modal
  const [showMoveCategoryModal, setShowMoveCategoryModal] = useState(false);
  // Add state to store the ID of the note being moved
  const [noteToMove, setNoteToMove] = useState(null);
  // Create a ref to store the select input element
  const categorySelectRef = useRef(null);

  const [sortDesc, setSortDesc] = useState(false);

  const { theme, setTheme } = useContext(ThemeContext);
  // Define classes based on the theme
  const offcanvasClass = theme === 'dark' ? 'offcanvasDarkMode' : '';
  const buttonClass = theme === 'dark' ? 'buttonDarkMode' : '';

  const [searchInput, setSearchInput] = useState(''); // Search input from the user
  const [filterCriteria, setFilterCriteria] = useState(''); // Filter criteria for notes (e.g., category)

  const [showModal, setShowModal] = useState(false);


  // Fetch notes and categories on initial render
  useEffect(() => {
    const fetchNotesAndCats = async () => {
      if (userId) {
        const token = await getToken({ template: 'codehooks' });
        const fetchedNotes = await getNotes(token);
        setNotes(fetchedNotes);
        const fetchedCategories = await getAllCats(token);
        setCategories(fetchedCategories);
        console.log('Fetched categories:', fetchedCategories); // Log fetched categories for debugging
      }
    };
    fetchNotesAndCats();
  }, [userId]);

  const handleSelectCategory = async (category) => {
    const token = await getToken({ template: 'codehooks' });
    setSelectedCategory(category);
    const fetchedNotes = await getNotesByCat(token, category);
    setNotes(fetchedNotes);
  };

  const generatePdf = async (title, content) => {
    generatePdfHTML(title, content);
  };


  const handleAddCategory = async () => {
    if (newCategory && newCategory.trim()) {
      const token = await getToken({ template: 'codehooks' });
      const newCat = {
        userId: userId,
        name: newCategory.trim(),
      };
      const createdCategory = await addCat(token, newCat); // Get the created category from the API response
      setCategories([...categories, createdCategory]); // Add the created category to the state
      setNewCategory('');
      console.log('Added new category:', createdCategory);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const token = await getToken({ template: 'codehooks' });
    await deleteNote(token, noteId);
    setNotes(notes.filter((note) => note._id !== noteId));
  };

  const handleCreateNewNote = async () => {
    // Create a default note for the user
    // const defaultNote = {
    //   title: 'Untitled Note',
    //   content: 'Type your note content here...',
    //   category: 'General'
    // };

    const defaultNote = {
      userId: userId,
      title: 'Untitled Note',
      content: 'Type your note content here...',
      category: 'General',
    };
    const token = await getToken({ template: 'codehooks' });
    const createdNote = await addNote(token, defaultNote);
    console.log('created new note is', createdNote);
    // Redirect the user to the editor page for the newly created note
    window.location.href = `/note/${createdNote._id}`;
  };

  // Handle moving the note to a different category
  const handleMoveNoteToCategory = async () => {
    // Get the selected category from the select input element
    const newCategory = categorySelectRef.current.value;
    // Update the note's category
    const modifiedNote = {
      title: noteToMove.title,
      content: noteToMove.content,
      category: newCategory,
      userId: userId,
    };
    const token = await getToken({ template: 'codehooks' });
    await updateNote(token, noteToMove._id, modifiedNote);
    // Refresh the notes list based on the selected category
    const fetchedNotes = await getNotes(token);
    setNotes(fetchedNotes);
    // Close the move category modal
    setShowMoveCategoryModal(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const token = await getToken({ template: 'codehooks' });
      await deleteCat(token, categoryId);
      setCategories(
        categories.filter((category) => category._id !== categoryId)
      );
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // const handleSort = async (e) => {
  //   try {
  //     e.preventDefault();
  //     if (sortDesc) {
  //       const fetchedNotes = await getNotesDesc(jwt, userId);
  //       setNotes(fetchedNotes);
  //     } else {
  //       const fetchedNotes = await getNotesAsce(jwt, userId);
  //       setNotes(fetchedNotes);
  //     }

  //     setSortDesc(!sortDesc);
  //   } catch (error) {
  //     console.error('Error sorting notes:', error);
  //   }
  // };

  const handleClickNote = async (e, id) => {
    e.preventDefault();
    window.location.href = `/note/${id}`;
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Fetch notes based on search input, filter criteria, and sort order
  const fetchNotes = async () => {
    let fetchedNotes = [];
    const token = await getToken({ template: 'codehooks' });
    if (searchInput) {
      fetchedNotes = await getSearchRes(token, searchInput);
    } else if (filterCriteria) {
      fetchedNotes = await getNotesByCat(token, filterCriteria);
    } else if (sortDesc) {
      fetchedNotes = await getNotesDesc(token, userId);
    } else {
      fetchedNotes = await getNotesAsce(token, userId);
    }
    setNotes(fetchedNotes);
  };

  // Handle search input change
  const handleSearch = async (e) => {
    setSearchInput(e.target.value);
    await fetchNotes();
  };

  // Handle filter criteria change

  const handleFilter = async (criteria) => {
    // Check if the selected filter criteria are the same as the current filter
    const token = await getToken({ template: 'codehooks' });
    if (criteria === filterCriteria) {
      // If they are the same, reset the filter criteria to show all notes
      setFilterCriteria('');
      // Fetch all notes
      const fetchedNotes = await getNotes(token);
      setNotes(fetchedNotes);
    } else {
      // Otherwise, update the filter criteria and fetch notes based on the new criteria
      setFilterCriteria(criteria);
      const fetchedNotes = await getNotesByCat(token, criteria);
      setNotes(fetchedNotes);
    }
  };

  // Handle sort order change
  const handleSort = async () => {
    setSortDesc(!sortDesc);
    await fetchNotes();
  };


  const handleNotificationClick = () => {
    setShowModal(true);
  };
  
  const handleScheduleClick = async (date, time) => {
    // Schedule the reminder based on the date and time the user entered
    const authToken = await getToken({ template: 'codehooks' });
    const reminder = {
      date: date,
      time: time.format('h:mm a'),
    };
    const result = await scheduleReminder(authToken, reminder);
    if (result.success) {
      NotificationManager.success('Reminder scheduled successfully');
    } else {
      NotificationManager.error('Failed to schedule reminder');
    }
  };

  const fetchReminders = async () => {
    const authToken = 'your-auth-token'; // replace with actual auth token
    const reminders = await getReminders(authToken);
    console.log(reminders); // do something with the reminders
  };

  const handleDeleteReminder = async (reminderId) => {
    const authToken = 'your-auth-token'; // replace with actual auth token
    const result = await deleteReminder(authToken, reminderId);
    if (result.success) {
      NotificationManager.success('Reminder deleted successfully');
    } else {
      NotificationManager.error('Failed to delete reminder');
    }
  };
  
  
  const Calendar = ({ onScheduleClick }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);

  const handleClick = () => {
    onScheduleClick(date, time);
  };

  return (
    <div className={styles['date-time-container']}>
    <DatePicker
      className={styles['date-picker']}
      selected={date}
      onChange={(date) => setDate(date)}
    />
    <Time className={styles['time-picker']} onTimeChange={setTime} />
    <Button className={styles['schedule-button']} onClick={handleClick}>
      Schedule
    </Button>
  </div>
  );
};



  // Update the notes list based on the selected category (if any)
  useEffect(() => {
    fetchNotes();
  }, [selectedCategory]);

  return (
    <div className={styles.dashboardContainer}>
      <Navbar
        expand={false}
        // variant='dark'
        // style={{
        //   backgroundColor: theme === 'dark' ? 'var(--gray5)' : '#808080',
        // }}
        className={styles.navBar}
      >
        <Navbar.Toggle
          aria-controls='category-section'
          onClick={() => setShowLeftMenu(!showLeftMenu)}
          className={styles.navBarToggle}
        >
          <BsList />
        </Navbar.Toggle>
        {/* If first name is not available, use email as name instead. */}
        <Navbar.Brand className={styles.navBarText}>{user.firstName ? user.firstName : user.primaryEmailAddress.emailAddress}&apos;s Notes</Navbar.Brand>

        <Navbar.Offcanvas
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="start"
          className={`sideBar-${theme}`}
          // className={styles.sideBar}
        >
          <Offcanvas.Header className="sideBarHeader" closeButton closeVariant={theme === "dark" ? 'white' : "black"}>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                  
              </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className={styles.sideBarBody}>
            <div className={styles.sideMenu}>
              
              <span className={`categoriesText ${styles.categoriesText}`}>Categories</span>
              <ListGroup className={`p-1 ${styles.sideBarCatList}`}>
                {categories.map((category) => (
                  <ListGroup.Item
                    className={` sideBarCatContainer ${styles.sideBarCatContainer}`}
                    key={category._id}
                  >
                    <div className='d-flex justify-content-between align-items-center'>
                      <Link
                        className={` sideBarCatLink ${styles.sideBarCatLink}`}
                        href={`/notes/${encodeURIComponent(category.name)}`}
                      >
                        {category.name}
                      </Link>
                      <Button
                        className={`deleteButton ${styles.deleteButton}`}
                        variant='danger'
                        size='sm'
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        
                        <BsX/>
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Form className={`${styles.newCategoryContainer} newCategoryContainer p-1`}>
                <Form.Group className={styles.newCategoryForm}>
                  <Form.Control
                    type='text'
                    value={newCategory}
                    
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder='New category'
                  />
                </Form.Group>
                <Button
                  onClick={handleAddCategory}
                  className={`fab-button newCategoryButton ${buttonClass} ${styles.newCategoryButton}`}
                >
                  <BsPlus/>
                </Button>
              </Form>

              <div className={`p-1 d-flex justify-content-between ${styles.sideBarBottom}`}>
                <div className={styles.userButton}>
                  <UserButton />
                </div>
                <Button className={`sideBarBottomButton ${styles.sideBarBottomButton}`} variant='link' onClick={() => signOut()}>
                  <BsBoxArrowRight />
                </Button>
                <Button className={`sideBarBottomButton ${styles.sideBarBottomButton}`} variant='link' onClick={handleToggleTheme}>
                  {theme === 'dark' ? <BsSun/> : <BsMoonStars/>}
                </Button>
              </div>
            </div>
            
          </Offcanvas.Body>
        </Navbar.Offcanvas>

      </Navbar>
      
      <div className='contentContainer' style={{ display: 'flex' }}>
        <div className={`sideBar-${theme} ${styles.sideBarContainer}`}>
          <div className={styles.sideMenuFixed}>
              
            <span className={`categoriesText ${styles.categoriesText}`}>Categories</span>
            <ListGroup className={`p-1 ${styles.sideBarCatList}`}>
              {categories.map((category) => (
                <ListGroup.Item
                  className={` sideBarCatContainer ${styles.sideBarCatContainer}`}
                  key={category._id}
                >
                  <div className='d-flex justify-content-between align-items-center'>
                    <Link
                      className={` sideBarCatLink ${styles.sideBarCatLink}`}
                      href={`/notes/${encodeURIComponent(category.name)}`}
                    >
                      {category.name}
                    </Link>
                    <Button
                      className={`deleteButton ${styles.deleteButton}`}
                      variant='danger'
                      size='sm'
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      
                      <BsX/>
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Form className={`${styles.newCategoryContainerFixed} newCategoryContainer p-1`}>
              <Form.Group className={styles.newCategoryForm}>
                <Form.Control
                  type='text'
                  value={newCategory}
                  
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder='New category'
                />
              </Form.Group>
              <Button
                onClick={handleAddCategory}
                className={`fab-button newCategoryButton ${buttonClass} ${styles.newCategoryButton}`}
              >
                <BsPlus/>
              </Button>
            </Form>

            <div className={`p-1 d-flex ${styles.sideBarBottomFixed}`}>
              <div className={styles.userButton}>
                <UserButton />
              </div>
              <Button className={`sideBarBottomButton ${styles.sideBarBottomButton}`} variant='link' onClick={() => signOut()}>
                <BsBoxArrowRight />
              </Button>
              <Button className={`sideBarBottomButton ${styles.sideBarBottomButton}`} variant='link' onClick={handleToggleTheme}>
                {theme === 'dark' ? <BsSun/> : <BsMoonStars/>}
              </Button>
            </div>
          </div>
        </div>
   
        <div className={`${styles.mainContainer} mainContent`}>
          {/* Action buttons */}

          <div className={`${styles.searchBar} d-flex justify-content-end p-3`}>
            <Form.Control
              type='text'
              value={searchInput}
              onChange={handleSearch}
              placeholder='Search...'
              className='mx-1'
            />
            <Dropdown onSelect={handleFilter} className={`${styles.filter} mx-1`}>
              
              <Dropdown.Toggle variant='outline-secondary'>
                <span>Filter</span>
                <BsFilter />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {/* Dynamically generate filter options */}
                {categories.map((category) => (
                  <Dropdown.Item
                    key={category._id}
                    eventKey={category.name}
                    active={category.name === filterCriteria}
                  >
                    {category.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant='outline-secondary'
              className={`${styles.sort} mx-1`}
              onClick={handleSort}
            >
              <span>Sort</span>
              {sortDesc ? <RiSortAsc /> : <RiSortDesc />}
            </Button>
          </div>
          {/* Notes list */}
          <Container className={styles.container}>
            <ListGroup>
              {notes.map((note) => (
                <ListGroup.Item className={styles.noteContainer} key={note._id}>
                  <div className='d-flex justify-content-between align-items-center'>
                    <Link
                      href={`/note/${note._id}`}
                      className={styles.noteLink}
                    >
                      {note.title || 'Untitled Note'}
                    </Link>
                    <Dropdown>
                      <Dropdown.Toggle
                        className={styles.dropdownList}
                        variant='link'
                        id={`dropdown-basic-${note._id}`}
                      >
                        <BsList />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {/* Add options to the dropdown menu */}
                        <Dropdown.Item href={`/note/${note._id}`}>
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            setNoteToMove(note);
                            setShowMoveCategoryModal(true);
                          }}
                        >
                          Move to Category
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => generatePdf(note.title, note.content)} href='#/action-2'>Export</Dropdown.Item>
                        <Dropdown.Item href='#/action-3'>Copy</Dropdown.Item>
                        
                        
                        <Dropdown.Item className="notifications-dropdown" href='#/action-4' onClick={handleNotificationClick}>
                          Notification
                        </Dropdown.Item>
                        <Modal
                            className={styles['modal-content']}
                            show={showModal}
                            onHide={() => setShowModal(false)}>
                          
                            <Modal.Header closeButton>
                              <Modal.Title>Schedule Reminder</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Calendar onScheduleClick={handleScheduleClick} />
                            </Modal.Body>
                        </Modal>
                        
                        
                        <Dropdown.Item
                          onClick={() => handleDeleteNote(note._id)}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className='text-center my-4'>
              {/* Floating action button to create a new note */}
              <Button
                variant='primary'
                className={`${styles.addButton} fab-button ${buttonClass}`}
                onClick={handleCreateNewNote}
              >
                <span>New Note</span>
                <BsPlus />
              </Button>
            </div>
          </Container>
        </div>
        {/* Move Category Modal */}
        <Modal
          show={showMoveCategoryModal}
          onHide={() => setShowMoveCategoryModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Move Note to Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId='categorySelect'>
              <Form.Label>Select Category</Form.Label>
              <Form.Control as='select' ref={categorySelectRef}>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={() => setShowMoveCategoryModal(false)}
            >
              Close
            </Button>
            <Button variant='primary' onClick={handleMoveNoteToCategory}>
              Move
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <style jsx>{`
        .fab-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .modal-90w {
          max-width: 400px;
        }
        .sideMenu {
          width: 100%;
          max-width: 400px;
        }

        @media (max-width: 320px) {
          .modal-90w {
            max-width: 30vw;
          }
        }

        .mainContent {
          flex: 1;
        }
        .sideMenuOpen {
          width: 100%;
        }
        .sideMenuClose {
          width: 0;
        }
        .contentContainer {
          filter: blur(${(props) => (props.showLeftMenu ? '5px' : '0')});
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
