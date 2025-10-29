import React, { useState } from 'react';
import { Card, Button, Modal, Form, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiFileText, FiCheck } from 'react-icons/fi';
import './EmpNotes.css';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const EmpNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'Important Customer Follow-up',
      content: 'Call Mr. Johnson about his BMW service completion. He requested a detailed report.',
      createdAt: '2025-10-29',
      updatedAt: '2025-10-29'
    },
    {
      id: 2,
      title: 'Parts Order Reminder',
      content: 'Need to order brake pads for Ford Focus. Check inventory levels.',
      createdAt: '2025-10-28',
      updatedAt: '2025-10-28'
    },
    {
      id: 3,
      title: 'Workshop Schedule',
      content: 'Team meeting scheduled for Friday at 2 PM to discuss new procedures.',
      createdAt: '2025-10-27',
      updatedAt: '2025-10-27'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const handleAddNote = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '' });
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content
    });
    setShowModal(true);
  };

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (noteToDelete !== null) {
      setNotes(notes.filter(note => note.id !== noteToDelete));
      setToastMessage('Note deleted successfully!');
      setToastVariant('success');
      setShowToast(true);
    }
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const handleSaveNote = () => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note =>
        note.id === editingNote.id
          ? { ...note, ...formData, updatedAt: currentDate }
          : note
      ));
      setToastMessage('Note updated successfully!');
    } else {
      // Add new note
      const newNote: Note = {
        id: Math.max(...notes.map(n => n.id), 0) + 1,
        ...formData,
        createdAt: currentDate,
        updatedAt: currentDate
      };
      setNotes([newNote, ...notes]);
      setToastMessage('Note added successfully!');
    }
    
    setToastVariant('success');
    setShowToast(true);
    setShowModal(false);
    setFormData({ title: '', content: '' });
  };  return (
    <>
      <Card className="notes-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="notes-title">My Notes</h5>
            <Button 
              variant="primary" 
              size="sm" 
              className="add-note-btn"
              onClick={handleAddNote}
            >
              <FiPlus className="me-2" />
              Add Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No notes yet. Click "Add Note" to create one.</p>
            </div>
          ) : (
            <Row className="notes-grid">
              {notes.map((note) => (
                <Col key={note.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                  <Card className="note-card h-100">
                    <Card.Body className="d-flex flex-column">
                      <div className="note-icon-wrapper mb-3">
                        <FiFileText className="note-icon" />
                      </div>
                      <h6 className="note-card-title mb-2">{note.title}</h6>
                      <p className="note-card-content flex-grow-1">{note.content}</p>
                      <div className="note-card-footer mt-auto">
                        <small className="text-muted d-block mb-2">
                          {note.createdAt}
                        </small>
                        <div className="note-card-actions">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 me-3"
                            onClick={() => handleEditNote(note)}
                            title="Edit note"
                          >
                            <FiEdit2 size={16} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-danger"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete note"
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Note Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter note content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <FiX className="me-2" />
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveNote}
            disabled={!formData.title || !formData.content}
          >
            <FiSave className="me-2" />
            {editingNote ? 'Update Note' : 'Save Note'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this note? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <FiCheck className="me-2" />
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default EmpNotes;
