import React, { useState } from 'react';

function ClassroomForm({ classrooms, setClassrooms }) {
  const [hallNo, setHallNo] = useState('');
  const [rows, setRows] = useState('');
  const [columns, setColumns] = useState('');
  const [seatingType, setSeatingType] = useState('single');

  const addClassroom = () => {
    if (!hallNo || !rows || !columns) {
      alert('Please fill in all required fields.');
      return;
    }

    const isHallNoTaken = classrooms.some(
      (classroom) => classroom.hallNo.toLowerCase() === hallNo.toLowerCase()
    );
    if (isHallNoTaken) {
      alert('Hall No already exists. Please choose a different Hall No.');
      return;
    }

    const newClassrooms = [
      ...classrooms,
      {
        hallNo,
        rows: parseInt(rows, 10),
        columns: parseInt(columns, 10),
        seatingType,
      },
    ];

    setClassrooms(newClassrooms);
    setHallNo('');
    setRows('');
    setColumns('');
    setSeatingType('single');
  };

  const deleteClassroom = (index) => {
    const updatedClassrooms = classrooms.filter((_, i) => i !== index);
    setClassrooms(updatedClassrooms);
  };

  const moveClassroom = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === classrooms.length - 1)
    ) {
      return;
    }

    const updatedClassrooms = [...classrooms];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedClassrooms[index], updatedClassrooms[newIndex]] = [updatedClassrooms[newIndex], updatedClassrooms[index]];
    setClassrooms(updatedClassrooms);
  };

  return (
    <div>
      <h2>Classroom Management</h2>
      <input
        type="text"
        value={hallNo}
        onChange={(e) => setHallNo(e.target.value)}
        placeholder="Hall No"
      />
      <input
        type="number"
        value={rows}
        onChange={(e) => setRows(e.target.value)}
        placeholder="Rows"
      />
      <input
        type="number"
        value={columns}
        onChange={(e) => setColumns(e.target.value)}
        placeholder="Columns"
      />
      <select
        value={seatingType}
        onChange={(e) => setSeatingType(e.target.value)}
      >
        <option value="single">Single Seater</option>
        <option value="double">Two Seater</option>
      </select>
      <button onClick={addClassroom}>Add Classroom</button>

      <h3>Classroom List</h3>
      <ul>
        {classrooms.map((classroom, index) => (
          <li key={index}>
            Hall No: {classroom.hallNo} - {classroom.rows}x{classroom.columns} - {classroom.seatingType}
            <button onClick={() => deleteClassroom(index)}>Delete</button>
            <button onClick={() => moveClassroom(index, 'up')}>Move Up</button>
            <button onClick={() => moveClassroom(index, 'down')}>Move Down</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClassroomForm;