
# LA Union Skymall Corporation

# Integrated Tenant & Commercial Space Information Management System

A **modern web-based property management system** designed to manage tenants, commercial spaces, compliance documents, scheduling, financial transactions, and operational requests for **LA Union Skymall Corporation**.

This system provides **role-based dashboards** for **Admin, Staff, and Tenants**, enabling efficient mall and property management through a centralized platform.

# 🌟 Key Features

## 👨‍💼 Admin System


* Real-time dashboard with **analytics  ** 
* Complete **User Management (CRUD)** both tenant and staff
* **Compliance Document Management** with approval for documents of tenants
* **Appointment Scheduling System** for staff
* **Operations Request Tracking**  for tenants
* **Financial Management** ( Payments,Reports) view and added to dashboard analytics
* **Commercial Space Unit Management**  for staff inquire or rent
* ** Import / Export ** data 
* **Search and Filtering** 

---

## 🧑‍💻 Staff System


* Staff **dashboard overview** 
* Profile management (input or updating of personal details)
* **View compliance documents** (read and updated)
* Schedule and appointment management (add and view)
* **Operation request handling** (inspection of maintenance for tenants and request of a tenants)
*  **Financial Management** typings of payment of a tenants manual   and reports 
*  **commercial unit information** (update and view )

---

## 🏢 Tenant System

* Personal **tenant dashboard** 
* Profile management (input or updating of personal details)
* **Upload compliance documents** (dti, and more)
* Schedule and appointment management (add and view) **appointments for the staff if have any concern **
* **Online payment portal**
*  **Financial Management** view the history of a payments 
*  **assigned commercial unit details**  (view) 

---



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



