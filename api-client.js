// api-client.js
const API_BASE_URL = '/api'; // Relative path for Railway

class ApiClient {
    async _fetch(method, endpoint, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Centers
    async getCenters() { 
        return this._fetch('GET', 'centers'); 
    }
    
    async createCenter(center) { 
        return this._fetch('POST', 'centers', center); 
    }
    
    async updateCenter(id, center) { 
        return this._fetch('PUT', `centers/${id}`, center); 
    }
    
    async deleteCenter(id) { 
        return this._fetch('DELETE', `centers/${id}`); 
    }

    // Students
    async getStudents() { 
        return this._fetch('GET', 'students'); 
    }
    
    async createStudent(student) { 
        return this._fetch('POST', 'students', student); 
    }
    
    async updateStudent(id, student) { 
        return this._fetch('PUT', `students/${id}`, student); 
    }
    
    async deleteStudent(id) { 
        return this._fetch('DELETE', `students/${id}`); 
    }

    // Applications
    async getApplications() { 
        return this._fetch('GET', 'applications'); 
    }
    
    async createApplication(application) { 
        return this._fetch('POST', 'applications', application); 
    }
    
    async updateApplication(id, application) { 
        return this._fetch('PUT', `applications/${id}`, application); 
    }
    
    async deleteApplication(id) { 
        return this._fetch('DELETE', `applications/${id}`); 
    }

    // Marks
    async getMarks() { 
        return this._fetch('GET', 'marks'); 
    }
    
    async createMark(mark) { 
        return this._fetch('POST', 'marks', mark); 
    }
    
    async updateMark(id, mark) { 
        return this._fetch('PUT', `marks/${id}`, mark); 
    }
    
    async deleteMark(id) { 
        return this._fetch('DELETE', `marks/${id}`); 
    }

    // Admins
    async getAdmins() { 
        return this._fetch('GET', 'admins'); 
    }
    
    async createAdmin(admin) { 
        return this._fetch('POST', 'admins', admin); 
    }
    
    async updateAdmin(id, admin) { 
        return this._fetch('PUT', `admins/${id}`, admin); 
    }
    
    async deleteAdmin(id) { 
        return this._fetch('DELETE', `admins/${id}`); 
    }

    // Authentication
    async adminLogin(email, password) {
        return this._fetch('POST', 'auth/admin', { email, password });
    }

    async centerLogin(email, password) {
        return this._fetch('POST', 'auth/center', { email, password });
    }

    async studentLogin(registration_id, date_of_birth) {
        return this._fetch('POST', 'auth/student', { registration_id, date_of_birth });
    }
}

const api = new ApiClient();