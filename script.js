// Global variables for data storage
let centers = [];
let students = [];
let applications = [];
let currentUser = null;

// Default admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@imtti.com',
    password: 'admin123'
};

// Load data from database on page load
async function loadDataFromDatabase() {
    try {
        centers = await api.getCenters();
        students = await api.getStudents();
        applications = await api.getApplications();
        console.log('Data loaded from database:', { centers: centers.length, students: students.length, applications: applications.length });
    } catch (error) {
        console.error('Error loading data from database:', error);
        // Fallback to localStorage if database fails
        loadDataFromLocalStorage();
    }
}

// Fallback to localStorage
function loadDataFromLocalStorage() {
    centers = JSON.parse(localStorage.getItem('centers') || '[]');
    students = JSON.parse(localStorage.getItem('students') || '[]');
    applications = JSON.parse(localStorage.getItem('applications') || '[]');
    console.log('Data loaded from localStorage:', { centers: centers.length, students: students.length, applications: applications.length });
}

// Save data to database
async function saveDataToDatabase() {
    try {
        // Data is automatically saved when using API calls
        console.log('Data saved to database');
    } catch (error) {
        console.error('Error saving data to database:', error);
        // Fallback to localStorage
        saveDataToLocalStorage();
    }
}

// Fallback to localStorage
function saveDataToLocalStorage() {
    localStorage.setItem('centers', JSON.stringify(centers));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('applications', JSON.stringify(applications));
    console.log('Data saved to localStorage');
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showStudentLoginModal() {
    document.getElementById('studentLoginModal').style.display = 'block';
}

function closeStudentLoginModal() {
    document.getElementById('studentLoginModal').style.display = 'none';
}

function closeAdminDashboard() {
    document.getElementById('adminDashboard').style.display = 'none';
}

function closeCenterDashboard() {
    document.getElementById('centerDashboard').style.display = 'none';
}

// Tab switching functions
function switchTab(tab) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding form
    if (tab === 'admin') {
        document.getElementById('adminLogin').classList.add('active');
    } else {
        document.getElementById('centerLogin').classList.add('active');
    }
}

function switchAdminTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding tab
    if (tab === 'centers') {
        document.getElementById('centersTab').classList.add('active');
        loadCenters();
    } else {
        document.getElementById('applicationsTab').classList.add('active');
        loadApplications();
    }
}

function switchCenterTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.center-tab').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding tab
    if (tab === 'students') {
        document.getElementById('studentsTab').classList.add('active');
        loadStudents();
    } else {
        document.getElementById('centerApplicationsTab').classList.add('active');
        loadCenterApplications();
    }
}

// Login Functions
async function adminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await api.adminLogin(email, password);
        if (response.success) {
            currentUser = { type: 'admin', email: email, id: response.user.id };
            closeLoginModal();
            // Redirect to full-page admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            showNotification('Invalid admin credentials', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        // Fallback to hardcoded credentials
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            currentUser = { type: 'admin', email: email };
            closeLoginModal();
            window.location.href = 'admin-dashboard.html';
        } else {
            showNotification('Invalid admin credentials', 'error');
        }
    }
}

async function centerLogin(event) {
    event.preventDefault();
    const email = document.getElementById('centerEmail').value;
    const password = document.getElementById('centerPassword').value;
    
    try {
        const response = await api.centerLogin(email, password);
        if (response.success) {
            currentUser = { type: 'center', email: email, centerId: response.user.id };
            closeLoginModal();
            // Store center email for dashboard access
            localStorage.setItem('currentCenterEmail', email);
            console.log('Redirecting to center dashboard...');
            // Redirect to center login page
            window.location.href = 'center-login.html';
        } else {
            showNotification('Invalid center credentials', 'error');
        }
    } catch (error) {
        console.error('Center login error:', error);
        // Fallback to localStorage
        console.log('Center login attempt:', email);
        console.log('Available centers:', centers);
        
        const center = centers.find(c => c.email === email && c.password === password);
        console.log('Found center:', center);
        
        if (center) {
            if (center.status === 'suspended') {
                showNotification('This center account has been suspended. Please contact the administrator.', 'error');
                return;
            }
            
            currentUser = { type: 'center', email: email, centerId: center.id };
            closeLoginModal();
            localStorage.setItem('currentCenterEmail', email);
            console.log('Redirecting to center dashboard...');
            window.location.href = 'center-login.html';
        } else {
            console.log('Center not found or invalid credentials');
            showNotification('Invalid center credentials', 'error');
        }
    }
}

// Student Login Function
function studentLogin(event) {
    event.preventDefault();
    const studentId = document.getElementById('studentLoginId').value;
    const password = document.getElementById('studentLoginPassword').value;
    
    // Convert DD-MM-YYYY to YYYY-MM-DD for comparison
    const passwordParts = password.split('-');
    if (passwordParts.length === 3) {
        const formattedPassword = `${passwordParts[2]}-${passwordParts[1]}-${passwordParts[0]}`;
        
        // Find student with matching credentials
        const student = students.find(s => s.studentId === studentId && s.password === formattedPassword);
        
        if (student) {
            currentUser = { type: 'student', studentId: studentId, student: student };
            closeStudentLoginModal();
            showStudentDashboard(student);
            showNotification(`Welcome, ${student.name}!`, 'success');
        } else {
            showNotification('Invalid student credentials', 'error');
        }
    } else {
        showNotification('Please enter date in DD-MM-YYYY format', 'error');
    }
}

// Show Student Dashboard
function showStudentDashboard(student) {
    const dashboardWindow = window.open('', '_blank', 'width=1000,height=700');
    dashboardWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Dashboard - ${student.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #1a1a1a; color: white; }
                .header { background: #2d2d2d; padding: 1rem 2rem; border-bottom: 2px solid #ffd700; }
                .header h1 { color: #ffd700; margin: 0; }
                .content { padding: 2rem; max-width: 800px; margin: 0 auto; }
                .info-card { background: #2d2d2d; padding: 1.5rem; margin: 1rem 0; border-radius: 10px; border: 1px solid #ffd700; }
                .info-card h3 { color: #ffd700; margin-bottom: 1rem; }
                .field { margin-bottom: 0.5rem; }
                .field label { font-weight: bold; color: #ffd700; }
                .btn { background: #ffd700; color: #1a1a1a; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
                .btn:hover { background: #ffed4e; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Student Dashboard - IMTTI</h1>
                <p>Welcome, ${student.name}!</p>
            </div>
            <div class="content">
                <div class="info-card">
                    <h3>Personal Information</h3>
                    <div class="field"><label>Name:</label> ${student.name}</div>
                    <div class="field"><label>Registration Number:</label> ${student.registrationNumber}</div>
                    <div class="field"><label>Email:</label> ${student.email}</div>
                    <div class="field"><label>Phone:</label> ${student.phone}</div>
                    <div class="field"><label>Course:</label> ${student.course}</div>
                    <div class="field"><label>Date of Birth:</label> ${student.dateOfBirth}</div>
                    <div class="field"><label>Status:</label> ${student.status}</div>
                </div>
                
                <div class="info-card">
                    <h3>Academic Information</h3>
                    <div class="field"><label>Registration Date:</label> ${new Date(student.registeredDate).toLocaleDateString()}</div>
                    <div class="field"><label>Center ID:</label> ${student.centerId}</div>
                </div>
                
                <div class="info-card">
                    <h3>Actions</h3>
                    <button class="btn" onclick="window.print()">Print Information</button>
                    <button class="btn" onclick="window.close()">Close Dashboard</button>
                </div>
            </div>
        </body>
        </html>
    `);
}

// Center Registration (Admin function)
function registerCenter(event) {
    event.preventDefault();
    const name = document.getElementById('centerName').value;
    const email = document.getElementById('newCenterEmail').value;
    const password = document.getElementById('newCenterPassword').value;
    const location = document.getElementById('centerLocation').value;
    
    // Check if center already exists
    if (centers.find(c => c.email === email)) {
        showNotification('Center with this email already exists', 'error');
        return;
    }
    
    const center = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        location: location,
        status: 'active', // active, suspended
        registeredDate: new Date().toISOString()
    };
    
    centers.push(center);
    saveData();
    loadCenters();
    showNotification('Center registered successfully!', 'success');
    
    // Clear form
    document.getElementById('centerName').value = '';
    document.getElementById('newCenterEmail').value = '';
    document.getElementById('newCenterPassword').value = '';
    document.getElementById('centerLocation').value = '';
}

// Student Registration (Center function)
function registerStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const phone = document.getElementById('studentPhone').value;
    const course = document.getElementById('studentCourse').value;
    const address = document.getElementById('studentAddress').value;
    const dateOfBirth = document.getElementById('studentDOB').value;
    
    // Generate registration number
    const registrationNumber = generateRegistrationNumber();
    
    const student = {
        id: Date.now().toString(),
        name: name,
        email: email,
        phone: phone,
        course: course,
        address: address,
        dateOfBirth: dateOfBirth,
        registrationNumber: registrationNumber,
        centerId: currentUser.centerId,
        registeredDate: new Date().toISOString(),
        status: 'registered',
        // Student login credentials
        studentId: registrationNumber,
        password: dateOfBirth ? dateOfBirth.replace(/-/g, '') : ''
    };
    
    students.push(student);
    saveData();
    loadStudents();
    showNotification(`Student registered successfully! Registration Number: ${registrationNumber}`, 'success');
    
    // Clear form
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentPhone').value = '';
    document.getElementById('studentCourse').value = '';
    document.getElementById('studentAddress').value = '';
    document.getElementById('studentDOB').value = '';
}

// Generate 12-digit registration number with year
function generateRegistrationNumber() {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `IMTTI${year}${randomPart}`;
}

// Load functions
function loadCenters() {
    const centersList = document.getElementById('centersList');
    centersList.innerHTML = '';
    
    if (centers.length === 0) {
        centersList.innerHTML = '<p style="color: #e5e5e5;">No centers registered yet.</p>';
        return;
    }
    
    centers.forEach(center => {
        const centerDiv = document.createElement('div');
        centerDiv.className = 'list-item';
        centerDiv.innerHTML = `
            <h4>${center.name}</h4>
            <p><strong>Email:</strong> ${center.email}</p>
            <p><strong>Location:</strong> ${center.location}</p>
            <p><strong>Registered:</strong> ${new Date(center.registeredDate).toLocaleDateString()}</p>
        `;
        centersList.appendChild(centerDiv);
    });
}

function loadStudents() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';
    
    const centerStudents = students.filter(s => s.centerId === currentUser.centerId);
    
    if (centerStudents.length === 0) {
        studentsList.innerHTML = '<p style="color: #e5e5e5;">No students registered yet.</p>';
        return;
    }
    
    centerStudents.forEach(student => {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'list-item';
        studentDiv.innerHTML = `
            <h4>${student.name}</h4>
            <p><strong>Registration Number:</strong> ${student.registrationNumber}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Status:</strong> ${student.status}</p>
            <button class="print-btn" onclick="printApplication('${student.id}')">Print Application</button>
        `;
        studentsList.appendChild(studentDiv);
    });
}

function loadApplications() {
    const applicationsList = document.getElementById('applicationsList');
    applicationsList.innerHTML = '';
    
    if (students.length === 0) {
        applicationsList.innerHTML = '<p style="color: #e5e5e5;">No applications found.</p>';
        return;
    }
    
    students.forEach(student => {
        const center = centers.find(c => c.id === student.centerId);
        const applicationDiv = document.createElement('div');
        applicationDiv.className = 'list-item';
        applicationDiv.innerHTML = `
            <h4>${student.name}</h4>
            <p><strong>Registration Number:</strong> ${student.registrationNumber}</p>
            <p><strong>Center:</strong> ${center ? center.name : 'Unknown'}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Status:</strong> ${student.status}</p>
            <button class="print-btn" onclick="printApplication('${student.id}')">Print Application</button>
        `;
        applicationsList.appendChild(applicationDiv);
    });
}

function loadCenterApplications() {
    const centerApplicationsList = document.getElementById('centerApplicationsList');
    centerApplicationsList.innerHTML = '';
    
    const centerStudents = students.filter(s => s.centerId === currentUser.centerId);
    
    if (centerStudents.length === 0) {
        centerApplicationsList.innerHTML = '<p style="color: #e5e5e5;">No applications found.</p>';
        return;
    }
    
    centerStudents.forEach(student => {
        const applicationDiv = document.createElement('div');
        applicationDiv.className = 'list-item';
        applicationDiv.innerHTML = `
            <h4>${student.name}</h4>
            <p><strong>Registration Number:</strong> ${student.registrationNumber}</p>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone}</p>
            <p><strong>Status:</strong> ${student.status}</p>
            <button class="print-btn" onclick="printApplication('${student.id}')">Print Application</button>
        `;
        centerApplicationsList.appendChild(applicationDiv);
    });
}

// Print Application Function
function printApplication(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showNotification('Student not found', 'error');
        return;
    }
    
    const center = centers.find(c => c.id === student.centerId);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>IMTTI Application - ${student.registrationNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #ffd700; }
                .section { margin-bottom: 20px; }
                .section h3 { color: #1a1a1a; border-bottom: 2px solid #ffd700; padding-bottom: 5px; }
                .field { margin-bottom: 10px; }
                .field label { font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>IMTTI - International Montessori Teachers Training Institute</h1>
                <h2>Student Application Form</h2>
            </div>
            
            <div class="section">
                <h3>Registration Details</h3>
                <div class="field">
                    <label>Registration Number:</label> ${student.registrationNumber}
                </div>
                <div class="field">
                    <label>Registration Date:</label> ${new Date(student.registeredDate).toLocaleDateString()}
                </div>
                <div class="field">
                    <label>Status:</label> ${student.status}
                </div>
            </div>
            
            <div class="section">
                <h3>Student Information</h3>
                <div class="field">
                    <label>Full Name:</label> ${student.name}
                </div>
                <div class="field">
                    <label>Email:</label> ${student.email}
                </div>
                <div class="field">
                    <label>Phone:</label> ${student.phone}
                </div>
                <div class="field">
                    <label>Course:</label> ${student.course}
                </div>
                <div class="field">
                    <label>Address:</label> ${student.address}
                </div>
            </div>
            
            <div class="section">
                <h3>Center Information</h3>
                <div class="field">
                    <label>Center Name:</label> ${center ? center.name : 'Unknown'}
                </div>
                <div class="field">
                    <label>Center Location:</label> ${center ? center.location : 'Unknown'}
                </div>
            </div>
            
            <div class="footer">
                <p>This application was generated on ${new Date().toLocaleString()}</p>
                <p>IMTTI - International Montessori Teachers Training Institute</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Data persistence functions
function saveData() {
    localStorage.setItem('imtti_centers', JSON.stringify(centers));
    localStorage.setItem('imtti_students', JSON.stringify(students));
}

function loadData() {
    const savedCenters = localStorage.getItem('imtti_centers');
    const savedStudents = localStorage.getItem('imtti_students');
    
    if (savedCenters) {
        centers = JSON.parse(savedCenters);
    }
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
}

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        this.reset();
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const adminDashboard = document.getElementById('adminDashboard');
    const centerDashboard = document.getElementById('centerDashboard');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === adminDashboard) {
        closeAdminDashboard();
    }
    if (event.target === centerDashboard) {
        closeCenterDashboard();
    }
}

// Initialize data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.course-card, .stat, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(el);
    });
});

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h4');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current) + '+';
        }, 16);
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Add CSS for loading animation
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadingStyles);

// Initialize database connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing database connection...');
    await loadDataFromDatabase();
    console.log('Database initialization complete');
});