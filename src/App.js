import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import ClassroomForm from './components/ClassroomForm';
import StudentForm from './components/StudentForm';
import SeatingArrangement from './components/SeatingArrangement';
import './App.css';

function App() {
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [hallNumber, setHallNumber] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const savedClassrooms = JSON.parse(localStorage.getItem('classrooms')) || [];
    const savedStudents = JSON.parse(localStorage.getItem('students')) || [];
    setClassrooms(savedClassrooms);
    setStudents(savedStudents);

    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop.current) {
        // Scrolling down
        setIsNavVisible(false);
      } else {
        // Scrolling up
        setIsNavVisible(true);
      }
      lastScrollTop.current = st <= 0 ? 0 : st;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('classrooms', JSON.stringify(classrooms));
    localStorage.setItem('students', JSON.stringify(students));
  }, [classrooms, students]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = document.querySelector('.navbar').offsetHeight;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="App">
      <Helmet>
        <title>Seating Arrangement System</title>
      </Helmet>

      <nav className={`navbar ${isNavVisible ? 'visible' : 'hidden'}`}>
        <div className="container">
          <ul>
            <li>
              <a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
            </li>
            <li>
              <a href="#classrooms" className={activeSection === 'classrooms' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('classrooms'); }}>Classrooms</a>
            </li>
            <li>
              <a href="#students" className={activeSection === 'students' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('students'); }}>Students</a>
            </li>
            <li>
              <a href="#seating" className={activeSection === 'seating' ? 'active' : ''} onClick={(e) => { e.preventDefault(); scrollToSection('seating'); }}>Seating Arrangement</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container main-content">
        <section id="home">
          <h2>Welcome to the Seating Arrangement System</h2>
          <p>Navigate through the sections to manage classrooms, students, and seating arrangements.</p>
        </section>

        <section id="classrooms">
          <h2>Classrooms</h2>
          <ClassroomForm 
            classrooms={classrooms} 
            setClassrooms={setClassrooms}
            hallNumber={hallNumber}
            setHallNumber={setHallNumber}
          />
        </section>

        <section id="students">
          <h2>Students</h2>
          <StudentForm students={students} setStudents={setStudents} />
        </section>

        <section id="seating">
          <h2>Seating Arrangement</h2>
          <SeatingArrangement 
            classrooms={classrooms} 
            students={students} 
            hallNumber={hallNumber}
          />
        </section>
      </div>

      <footer className="branding-footer">
        <div className="container">
          <p>POWERED BY NEXUS</p>
        </div>
      </footer>
    </div>
  );
}

export default App;