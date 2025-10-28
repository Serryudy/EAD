import React, { useState } from 'react';
import { Card, Button, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import './EmpNotes.css';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
}

const EmpNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: 'Important Customer Follow-up',
      content: 'Call Mr. Johnson about his BMW service completion. He requested a detailed report.',
      createdAt: '2025-10-29',
      updatedAt: '2025-10-29',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Parts Order Reminder',
      content: 'Need to order brake pads for Ford Focus. Check inventory levels.',
      createdAt: '2025-10-28',
      updatedAt: '2025-10-28',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Workshop Schedule',
      content: 'Team meeting scheduled for Friday at 2 PM to discuss new procedures.',
      createdAt: '2025-10-27',
      updatedAt: '2025-10-27',
      priority: 'low'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAddNote = () => {
    setEditingNote(null);
    setFormData({ title: '', content: '', priority: 'medium' });
    setShowModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      priority: note.priority
    });
    setShowModal(true);
  };

  const handleDeleteNote = (noteId: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
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
    } else {
      // Add new note
      const newNote: Note = {
        id: Math.max(...notes.map(n => n.id), 0) + 1,
        ...formData,
        createdAt: currentDate,
        updatedAt: currentDate
      };
      setNotes([newNote, ...notes]);
    }
    
    setShowModal(false);
    setFormData({ title: '', content: '', priority: 'medium' });
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: 'secondary', text: 'Low' },
      medium: { bg: 'warning', text: 'Medium' },
      high: { bg: 'danger', text: 'High' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge bg={config.bg} className="priority-badge">{config.text}</Badge>;
  };

  return (
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
            <ListGroup variant="flush" className="notes-list">
              {notes.map((note) => (
                <ListGroup.Item key={note.id} className="note-item">
                  <div className="note-header">
                    <div className="note-title-section">
                      <h6 className="note-item-title">{note.title}</h6>
                      {getPriorityBadge(note.priority)}
                    </div>
                    <div className="note-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="note-action-btn me-2"
                        onClick={() => handleEditNote(note)}
                      >
                        <FiEdit2 />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="note-action-btn"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                  <p className="note-content">{note.content}</p>
                  <div className="note-footer">
                    <small className="text-muted">
                      Created: {note.createdAt}
                      {note.updatedAt !== note.createdAt && (
                        <> | Updated: {note.updatedAt}</>
                      )}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
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

            <Form.Group className="mb-3">
              <Form.Label htmlFor="priority-select">Priority</Form.Label>
              <Form.Select
                id="priority-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                aria-label="Select note priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
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
    </>
  );
};

export default EmpNotes;
