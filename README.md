
# LA Union Skymall Corporation

# Integrated Tenant & Commercial Space Information Management System

A **modern web-based property management system** designed to manage tenants, commercial spaces, compliance documents, scheduling, financial transactions, and operational requests for **LA Union Skymall Corporation**.

This system provides **role-based dashboards** for **Admin, Staff, and Tenants**, enabling efficient mall and property management through a centralized platform.

# 🌟 Key Features

## 👨‍💼 Admin System

Full administrative control over the entire system.

* Real-time dashboard with **analytics **
* Complete **User Management (CRUD)**
* **Compliance Document Management** with approval workflow
* **Appointment Scheduling System**
* **Operations Request Tracking**
* **Financial Management** (Invoices, Payments, Revenue Reports) view 
* **Commercial Space Unit Management**
* ** Import / Export **
* Advanced **Search and Filtering**

---

## 🧑‍💻 Staff System

Operational support tools for staff members.

* Staff **dashboard overview**
* Profile management
* **View compliance documents** (read-only and updated)
* Schedule and appointment management
* **Operation request handling**
* typings of fiancial  and reports
* Edit **commercial unit information**

---

## 🏢 Tenant System

Self-service portal for tenants.

* Personal **tenant dashboard**
* Profile and account management
* **Upload compliance documents**
* Book **appointments **
* **Online payment portal**
* Submit **maintenance requests**
* View **assigned commercial unit details**

---

# 🛠 Technology Stack


# 🚀 Installation

## Prerequisites

Make sure you have installed:

* Node.js **18+**
* npm or pnpm

---

## 1️⃣ Install Dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

## 2️⃣ Setup Environment Variables

Create a `.env` file in the project root.

```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 3️⃣ Run Development Server

```bash
npm run dev
```

Application will run at:

```
http://localhost:5173
```

---

## 4️⃣ Build Production Version

```bash
npm run build
```

Output files will be generated inside the **dist/** folder.

---

# 🔐 Authentication

### Demo Accounts

| Role   | Email                                           | Password |
| ------ | ----------------------------------------------- | -------- |
| Admin  | [admin@skymall.com](mailto:admin@skymall.com)   | password |
| Staff  | [staff@skymall.com](mailto:staff@skymall.com)   | password |
| Tenant | [tenant@skymall.com](mailto:tenant@skymall.com) | password |

---

# 🔑 User Roles

## Admin

* Full system access
* Manage users
* Approve compliance documents
* Manage commercial spaces
* Process invoices and payments
* View analytics and reports

---

## Staff

* View compliance records
* Manage schedules
* Handle operation requests
* Update commercial unit information
* View financial reports

---

## Tenant

* Upload compliance documents
* Book appointments
* Pay invoices
* Submit maintenance requests
* View assigned commercial units

---

# 🏗 Project Structure

```
src
 ├── app
 │   ├── components
 │   │   ├── Layout.jsx
 │   │   ├── Navbar.jsx
 │   │   ├── Sidebar.jsx
 │   │   └── ui
 │   │
 │   ├── context
 │   │   ├── AuthContext.jsx
 │   │   └── ThemeContext.jsx
 │   │
 │   ├── pages
 │   │   ├── admin
 │   │   ├── staff
 │   │   └── tenant
 │   │
 │   ├── services
 │   │   └── api.js
 │   │
 │   └── routes.jsx
 │
 └── styles
     ├── index.css
     ├── tailwind.css
     └── theme.css
```

---

# 🔌 Backend Integration

This frontend connects to a backend built using:

* Django
* Django REST Framework

Backend responsibilities include:

* API endpoints
* Authentication (JWT)
* Database management
* File uploads
* Payment processing
* Business logic

---

# 📊 System Modules

### 1️⃣ User Management

* Create, edit, delete users
* Role-based access control
* Import/export users

---

### 2️⃣ Compliance Management

* Upload and track documents
* Approval workflows
* Expiration monitoring
* Automated reminders

---

### 3️⃣ Schedule Management

* Appointment booking
* Calendar management
* Resource scheduling

---

### 4️⃣ Operations Management

* Maintenance requests
* Ticket tracking
* Task assignment

---

### 5️⃣ Financial Management

* Invoice generation
* Payment tracking
* Revenue analytics
* Financial reports

---

### 6️⃣ Commercial Space Management

* Unit database
* Tenant assignments
* Occupancy monitoring
* Lease tracking

---

# 🎨 UI/UX Features

* Modern **dashboard interface**
* Responsive layout (Mobile / Tablet / Desktop)
* Dark mode support
* Accessible UI components
* Interactive charts and tables
* Smooth animations and transitions

---



# 🔒 Security

* JWT Authentication
* Role-based access control
* Input validation
* Secure API communication
* File upload restrictions

---

# 📈 Performance

* Code splitting
* Tree shaking
* Optimized build using Vite
* Lazy loading for pages

---

# 🤝 Contributing

1. Fork repository
2. Create new branch

```
git checkout -b feature/new-feature
```

3. Commit changes

```
git commit -m "Add new feature"
```

4. Push to branch

```
git push origin feature/new-feature
```

5. Open Pull Request

---

# 📄 License

Proprietary software developed for **LA Union Skymall Corporation**.

---

# 🙏 Acknowledgments

* Tailwind CSS
* Radix UI
* Recharts
* React Router
* Lucide


