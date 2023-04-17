// pages/editor.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import styles from '../styles/editor.module.css';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

// Dynamic import for react-quill to prevent server-side rendering issues
const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const Editor = () => {
  // Initialize states for the note title and content
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // State to track auto-save status
  const [isSaved, setIsSaved] = useState(false);

  // Use the useRouter hook to programmatically navigate back to the dashboard
  const router = useRouter();

  // Simulate auto-save functionality
  useEffect(() => {
    if (noteContent) {
      setIsSaved(false);
      const timeoutId = setTimeout(() => {
        setIsSaved(true);
      }, 1000); // Simulated auto-save delay
      return () => clearTimeout(timeoutId);
    }
  }, [noteContent]);

  return (
    <>
      {/* Top bar */}
      <div className={styles.topBar}>
        {/* Left button: Go back to dashboard */}
        <Button
          variant='outline-light'
          className={styles.backButton}
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft />
        </Button>
        {/* Mid part: Display note title (non-editable) */}
        <div className={styles.pageTitle}>{noteTitle || 'Untitled'}</div>
        {/* Right part: Auto-save status */}
        <div className={styles.saveStatus}>
          {isSaved ? 'Saved' : 'Saving...'}
        </div>
      </div>
      <div className={styles.editorContainer}>
        {/* Title input (editable) */}
        <input
          className={styles.noteTitleInput}
          type='text'
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder='Note Title'
        />

        {/* Note Editor */}
        <ReactQuill
          className={styles.noteEditor}
          value={noteContent}
          onChange={setNoteContent}
          placeholder='Start writing your note...'
        />
      </div>
    </>
  );
};

export default Editor;
