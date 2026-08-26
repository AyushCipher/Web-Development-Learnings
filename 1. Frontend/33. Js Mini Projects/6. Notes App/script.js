const createBtn = document.getElementById('createBtn');
const notesContainer = document.getElementById('notesContainer');

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notesContainer.innerHTML = '';
  notes.forEach((note, index) => {
    createNote(note, index);
  });
}

function createNote(content = "", index = null) {
  const note = document.createElement('div');
  note.classList.add('note');

  const textarea = document.createElement('textarea');
  textarea.value = content;

  textarea.addEventListener('input', () => {
    updateNote(index, textarea.value);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('deleteBtn');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.addEventListener('click', () => {
    deleteNote(index);
  });

  note.appendChild(textarea);
  note.appendChild(deleteBtn);
  notesContainer.appendChild(note);
}

function updateNote(index, content) {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes[index] = content;
  localStorage.setItem('notes', JSON.stringify(notes));
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
}

createBtn.addEventListener('click', () => {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.push('');
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
});

loadNotes();
