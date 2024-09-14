import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import "../App.css";

function SeatingArrangement({ classrooms = [], students = [] }) {
  const [alert, setAlert] = useState('');
  const seatingRefs = useRef([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [arrangements, setArrangements] = useState([]);
  const [collegeName, setCollegeName] = useState('KNOWLEDGE INSTITUTE OF TECHNOLOGY, SALEM - 637 504');
  const [institutionType, setInstitutionType] = useState('(An autonomous institution)');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');

  const convertToRoman = (year) => {
    switch(year) {
      case '1st': return 'I';
      case '2nd': return 'II';
      case '3rd': return 'III';
      case '4th': return 'IV';
      default: return year;
    }
  };

  const romanToInt = (roman) => {
    const romanValues = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    return romanValues[roman] || 0;
  };

  const getYearsInClassroom = (classroom) => {
    const years = new Set();
    classroom.forEach(row => {
      row.forEach(seat => {
        if (seat && seat.length > 0) {
          seat.forEach(student => student && student.year && years.add(student.year));
        }
      });
    });
    return Array.from(years)
      .sort((a, b) => romanToInt(a) - romanToInt(b))
      .map(year => `${year} CSE`)
      .join(' & ');
  };

  useEffect(() => {
    if (alert) {
      window.alert(alert);
      setAlert('');
    }
  }, [alert]);

  const generateSeatingArrangement = useCallback(() => {
    let seating = [];
    let flattenedStudents = [];

    students.forEach((student) => {
      const start = parseInt(student.startRegister.replace(/^[A-Z]/, ''), 10);
      const end = parseInt(student.endRegister.replace(/^[A-Z]/, ''), 10);
      for (let reg = start; reg <= end; reg++) {
        flattenedStudents.push({
          year: convertToRoman(student.year),
          register: `${student.startRegister.replace(/\d+$/, '')}${reg.toString().padStart(3, '0')}`,
        });
      }
    });

    let totalStudentsSeated = 0;

    classrooms.forEach((classroom) => {
      const { rows, columns, seatingType, hallNo } = classroom;
      let rowData = Array.from({ length: rows }, () => Array(columns).fill(null));
      let classroomStudentsSeated = 0;

      for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
          const currentRow = col % 2 === 0 ? row : rows - row - 1; // snake pattern column-wise

          if (!rowData[currentRow][col]) {
            rowData[currentRow][col] = [];
          }

          while (rowData[currentRow][col].length < (seatingType === 'double' ? 2 : 1) && totalStudentsSeated < flattenedStudents.length) {
            let studentIndex = totalStudentsSeated;
            let student = flattenedStudents[studentIndex];

            // Check if the seat is not empty and the last student in the seat is from the same year
            if (rowData[currentRow][col].length > 0 && 
                rowData[currentRow][col][rowData[currentRow][col].length - 1].year === student.year) {
              // Find the next student from a different year
              studentIndex = flattenedStudents.findIndex((s, index) => 
                index > totalStudentsSeated && s.year !== student.year
              );

              // If no student from a different year is found, break the loop
              if (studentIndex === -1) break;

              student = flattenedStudents[studentIndex];
            }

            rowData[currentRow][col].push(student);
            flattenedStudents.splice(studentIndex, 1);
            classroomStudentsSeated++;
          }

          if (flattenedStudents.length === 0) break;
        }
        if (flattenedStudents.length === 0) break;
      }

      seating.push({ hallNo, arrangement: rowData, studentsSeated: classroomStudentsSeated });
    });

    if (flattenedStudents.length > 0) {
      setAlert(`Not enough seats in all classrooms for all students! ${flattenedStudents.length} students couldn't be seated.`);
    }

    setArrangements(seating);
  }, [classrooms, students]);

  useEffect(() => {
    generateSeatingArrangement();
  }, [generateSeatingArrangement]);

  const handleSeatRightClick = (cIndex, rIndex, sIndex, event) => {
    event.preventDefault();
    const newArrangements = [...arrangements];
    const seat = newArrangements[cIndex].arrangement[rIndex][sIndex];

    if (!seat || seat.length === 0) {
      newArrangements[cIndex].arrangement[rIndex][sIndex] = [{ register: 'New Seat', year: 'N/A' }];
    } else if (seat.length === 1 && seat[0].register === 'Blocked') {
      newArrangements[cIndex].arrangement[rIndex][sIndex] = null;
    } else {
      newArrangements[cIndex].arrangement[rIndex][sIndex] = [{ register: 'Blocked', year: 'N/A' }];
    }

    setArrangements(newArrangements);
  };

  const downloadSeatingImage = (index) => {
    if (seatingRefs.current[index]) {
      const scale = 2;
      html2canvas(seatingRefs.current[index], {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.tagName === 'BUTTON',
        logging: false,
        windowWidth: seatingRefs.current[index].scrollWidth * scale,
        windowHeight: seatingRefs.current[index].scrollHeight * scale
      }).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, `seating-arrangement-${arrangements[index].hallNo}.png`);
        }, 'image/png');
      });
    }
  };

  const downloadAllImagesAsZip = () => {
    const zip = new JSZip();
    const scale = 2;

    const imagePromises = seatingRefs.current.map((ref, index) =>
      html2canvas(ref, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => element.tagName === 'BUTTON',
        logging: false,
        windowWidth: ref.scrollWidth * scale,
        windowHeight: ref.scrollHeight * scale
      }).then((canvas) => {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            zip.file(`seating-arrangement-${arrangements[index].hallNo}.png`, blob);
            resolve();
          }, 'image/png');
        });
      })
    );

    Promise.all(imagePromises).then(() => {
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'seating-arrangements.zip');
      });
    });
  };

  return (
    <div className="seating-arrangement-container" style={{ width: '210mm', margin: '0 auto', padding: '20mm 10mm', boxSizing: 'border-box' }}>
      <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '5mm', margin: '5mm 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '10pt' }}>
            Date:
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ marginLeft: '2mm', padding: '1mm', fontSize: '10pt' }}
            />
          </label>
          <label style={{ fontSize: '10pt' }}>
            Assessment Type:
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              style={{ marginLeft: '2mm', padding: '1mm', fontSize: '10pt' }}
            >
              <option value="">Select Assessment Type</option>
              <option value="Internal Assessment Test - I">Internal Assessment Test - I</option>
              <option value="Internal Assessment Test - II">Internal Assessment Test - II</option>
              <option value="Internal Assessment Test - III">Internal Assessment Test - III</option>
            </select>
          </label>
        </div>
        <label style={{ fontSize: '10pt' }}>
          College Name:
          <input
            type="text"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            style={{ marginLeft: '2mm', padding: '1mm', fontSize: '10pt', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: '10pt' }}>
          Institution Type:
          <input
            type="text"
            value={institutionType}
            onChange={(e) => setInstitutionType(e.target.value)}
            style={{ marginLeft: '2mm', padding: '1mm', fontSize: '10pt', width: '100%' }}
          />
        </label>
        <label style={{ fontSize: '10pt' }}>
          Department:
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ marginLeft: '2mm', padding: '1mm', fontSize: '10pt', width: '100%' }}
          />
        </label>
      </div>

      {arrangements.map(({ hallNo, arrangement }, cIndex) => (
        <div key={cIndex} ref={(el) => (seatingRefs.current[cIndex] = el)} className="seating-layout" style={{ marginBottom: '10mm', border: '0.5mm solid #ccc', padding: '5mm' }}>
          <div className="header-template" style={{ textAlign: 'center', marginBottom: '5mm' }}>
            <h1 style={{ fontSize: '14pt', marginBottom: '2mm' }}>{collegeName}</h1>
            <h2 style={{ fontSize: '12pt', marginBottom: '2mm' }}>{institutionType}</h2>
            <h2 style={{ fontSize: '12pt', marginBottom: '2mm' }}>{department}</h2>
            <p style={{ fontSize: '10pt', fontWeight: 'bold', paddingLeft:'560px' }}>Date: {selectedDate}</p>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '2mm 0' }}>{selectedAssessment}</h3>
            <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>Hall No: {hallNo}</p>
            <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>({getYearsInClassroom(arrangement)})</p>
          </div>
          <table className="seating-grid" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '9pt' }}>
            <thead>
              <tr>
                {Array.from({ length: arrangement[0].length }).map((_, i) => (
                  <th key={i} style={{ border: '0.2mm solid black', padding: '2mm', backgroundColor: '#f0f0f0' }}>Column {i + 1}</th> 
                ))}
              </tr>
            </thead>
            <tbody>
              {arrangement.map((row, rIndex) => (
                <tr key={rIndex} style={{ backgroundColor: rIndex % 2 === 0 ? '#f8f8f8' : 'white' }}>
                  {row.map((seat, sIndex) => (
                    <td 
                      key={sIndex} 
                      style={{ 
                        border: '0.2mm solid black', 
                        padding: '2mm', 
                        textAlign: 'center', 
                        minHeight: '15mm', 
                        verticalAlign: 'middle',
                        backgroundColor: seat && seat[0] && seat[0].register === 'Blocked' ? '#ffcccc' : 'inherit'
                      }}
                      onContextMenu={(e) => handleSeatRightClick(cIndex, rIndex, sIndex, e)}
                    >
                      {seat && seat.length > 0 ? (
                        <>
                          <div style={{ fontWeight: 'bold', fontSize: '9pt' }}>{seat.map(student => student.register).join(', ')}</div>
                          <div style={{ fontSize: '8pt', marginTop: '1mm' }}>
                            ({seat.map(student => student.year).join(' & ')})
                          </div>
                        </>
                      ) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '5mm 20mm', fontSize: '10pt', marginTop: '5mm' }}>
            <p>Exam Coordinator</p>
            <p>HOD</p>
          </div>
          <button onClick={() => downloadSeatingImage(cIndex)} style={{ fontSize: '10pt', padding: '2mm 4mm', margin: '3mm 0' }}>Download This Arrangement</button>
        </div>
      ))}
      {arrangements.length > 0 && (
        <button onClick={downloadAllImagesAsZip} style={{ fontSize: '10pt', padding: '2mm 4mm', margin: '3mm 0' }}>Download All Images as Zip</button>
      )}
    </div>
  );
}

export default SeatingArrangement;