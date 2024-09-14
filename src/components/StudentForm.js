import React, { useState, useEffect } from 'react';

function StudentForm({ students, setStudents }) {
  const [year, setYear] = useState('1st');
  const [startRegister, setStartRegister] = useState('');
  const [endRegister, setEndRegister] = useState('');
  const [singleRegister, setSingleRegister] = useState('');
  const [inputMode, setInputMode] = useState('range'); // 'range' or 'single'
  const [deleteRegister, setDeleteRegister] = useState('');

  useEffect(() => {
    const savedStudents = JSON.parse(localStorage.getItem('students')) || [];
    setStudents(savedStudents);
  }, [setStudents]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  const isValidRegisterNumber = (register) => {
    return /^[A-Z]?\d+$/.test(register);
  };

  const getNumericValue = (register) => {
    return parseInt(register.replace(/^[A-Z]/, ''), 10);
  };

  const addStudent = () => {
    if (inputMode === 'range') {
      if (!isValidRegisterNumber(startRegister) || !isValidRegisterNumber(endRegister)) {
        alert("Register numbers should be digits only (e.g., 15) or one letter followed by digits (e.g., A15).");
        return;
      }

      const start = getNumericValue(startRegister);
      const end = getNumericValue(endRegister);

      if (start > end) {
        alert("Start register number should be less than or equal to end register number.");
        return;
      }

      const newStudent = { year, startRegister, endRegister };
      setStudents([...students, newStudent]);
      setStartRegister('');
      setEndRegister('');
    } else {
      if (!isValidRegisterNumber(singleRegister)) {
        alert("Register number should be digits only (e.g., 15) or one letter followed by digits (e.g., A15).");
        return;
      }

      const newStudent = { year, startRegister: singleRegister, endRegister: singleRegister };
      setStudents([...students, newStudent]);
      setSingleRegister('');
    }

    setYear('1st');
  };

  const deleteStudent = (index) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
  };

  const moveStudentUp = (index) => {
    if (index === 0) return;
    const updatedStudents = [...students];
    [updatedStudents[index - 1], updatedStudents[index]] = [updatedStudents[index], updatedStudents[index - 1]];
    setStudents(updatedStudents);
  };

  const moveStudentDown = (index) => {
    if (index === students.length - 1) return;
    const updatedStudents = [...students];
    [updatedStudents[index], updatedStudents[index + 1]] = [updatedStudents[index + 1], updatedStudents[index]];
    setStudents(updatedStudents);
  };

  const deleteRegisterFromRange = (index) => {
    if (!isValidRegisterNumber(deleteRegister)) {
      alert("Invalid register number format.");
      return;
    }

    const updatedStudents = [...students];
    const student = updatedStudents[index];
    const registerToDelete = getNumericValue(deleteRegister);
    const start = getNumericValue(student.startRegister);
    const end = getNumericValue(student.endRegister);

    if (registerToDelete < start || registerToDelete > end) {
      alert("Register number is not within the specified range.");
      return;
    }

    if (registerToDelete === start && registerToDelete === end) {
      // If it's a single number range, remove the entire student entry
      updatedStudents.splice(index, 1);
    } else if (registerToDelete === start) {
      // If it's the start of the range, move the start up
      student.startRegister = (start + 1).toString().padStart(student.startRegister.length, '0');
    } else if (registerToDelete === end) {
      // If it's the end of the range, move the end down
      student.endRegister = (end - 1).toString().padStart(student.endRegister.length, '0');
    } else {
      // If it's in the middle, split the range
      const newStudent = {
        year: student.year,
        startRegister: (registerToDelete + 1).toString().padStart(student.startRegister.length, '0'),
        endRegister: student.endRegister
      };
      student.endRegister = (registerToDelete - 1).toString().padStart(student.endRegister.length, '0');
      updatedStudents.splice(index + 1, 0, newStudent);
    }

    setStudents(updatedStudents);
    setDeleteRegister('');
  };

  return (
    <div className="student-form">
      <h2>Add Student Details</h2>
      <div className="form-controls">
        <select 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="form-select"
        >
          <option value="1st">1st Year</option>
          <option value="2nd">2nd Year</option>
          <option value="3rd">3rd Year</option>
          <option value="4th">4th Year</option>
        </select>

        <select
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value)}
          className="form-select"
        >
          <option value="range">Range</option>
          <option value="single">Single</option>
        </select>

        {inputMode === 'range' ? (
          <>
            <input
              type="text"
              value={startRegister}
              onChange={(e) => setStartRegister(e.target.value.toUpperCase())}
              placeholder="Start Register Number (e.g., A15 or 15)"
              className="form-input"
            />
            <input
              type="text"
              value={endRegister}
              onChange={(e) => setEndRegister(e.target.value.toUpperCase())}
              placeholder="End Register Number (e.g., A20 or 20)"
              className="form-input"
            />
          </>
        ) : (
          <input
            type="text"
            value={singleRegister}
            onChange={(e) => setSingleRegister(e.target.value.toUpperCase())}
            placeholder="Single Register Number (e.g., A15 or 15)"
            className="form-input"
          />
        )}
        <button onClick={addStudent} className="form-button">Add Student</button>
      </div>

      <h3>Student List</h3>
      <ul className="student-list">
        {students.map((student, index) => (
          <li key={index} className="student-item">
            <div>
              <span>{student.year} - {student.startRegister}{student.startRegister !== student.endRegister ? ` to ${student.endRegister}` : ''}</span>
            </div>
            <div className="student-actions">
              <input
                type="text"
                value={deleteRegister}
                onChange={(e) => setDeleteRegister(e.target.value.toUpperCase())}
                placeholder="Delete Register"
                className="form-input delete-input"
              />
              <button onClick={() => deleteRegisterFromRange(index)} className="action-button delete-register">Delete</button>
              <button onClick={() => moveStudentUp(index)} className="action-button">↑</button>
              <button onClick={() => moveStudentDown(index)} className="action-button">↓</button>
              <button onClick={() => deleteStudent(index)} className="action-button delete">×</button>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .student-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .form-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .form-select, .form-input, .form-button {
          padding: 8px;
          font-size: 14px;
        }
        .form-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          cursor: pointer;
        }
        .form-button:hover {
          background-color: #45a049;
        }
        .student-list {
          list-style-type: none;
          padding: 0;
        }
        .student-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .student-actions {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .action-button {
          padding: 5px 10px;
          font-size: 14px;
          cursor: pointer;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
        }
        .action-button:hover {
          background-color: #e0e0e0;
        }
        .action-button.delete {
          background-color: #ff4d4d;
          color: white;
        }
        .action-button.delete:hover {
          background-color: #ff3333;
        }
        .delete-input {
          width: 100px;
        }
        .delete-register {
          background-color: #ff9800;
          color: white;
        }
        .delete-register:hover {
          background-color: #f57c00;
        }
      `}</style>
    </div>
  );
}

export default StudentForm;