# Service Complaint Management System

A modern web application for managing service complaints, courier orders, and pickup requests. Built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Authentication**: Secure login/signup with email, password reset functionality, and "Remember me" option
- **Complaint Management**: Submit, track, and manage service complaints
- **Admin Dashboard**: Comprehensive admin panel for managing users, complaints, and settings
- **Courier Orders**: Order courier services for shipping devices
- **Pickup Scheduling**: Schedule device pickups for repair
- **Role-Based Access**: Different access levels for administrators, employees, and service technicians
- **User Profiles**: Manage personal and company information

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or bun package manager
- Supabase account (for backend services)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `complaints` | Service complaint records |
| `courier_orders` | Courier order requests |
| `pickup_requests` | Scheduled pickup requests |
| `user_roles` | User role assignments |
| `service_options` | Available service options |
| `package_contents` | Package content definitions |

### User Roles

- **main_administrator**: Full system access
- **employee**: Standard employee access
- **service_technician**: Technician-specific access

### Complaint Statuses

- `submitted` - Initial submission
- `in_progress` - Being processed
- `awaiting_shipment` - Ready for shipping
- `completed` - Repair completed
- `cancelled` - Cancelled

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   └── ui/             # Reusable UI components (shadcn)
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   └── useRole.tsx     # Role management hook
├── integrations/
│   └── supabase/       # Supabase client and types
├── pages/
│   ├── admin/          # Admin pages
│   ├── Auth.tsx        # Authentication page
│   ├── Dashboard.tsx   # User dashboard
│   ├── NewComplaint.tsx # Complaint submission
│   ├── Profile.tsx     # User profile
│   └── ...
└── lib/                # Utility functions

supabase/
└── functions/
    └── get-complaint/  # Edge function for fetching complaint details
```

## 🔌 API Endpoints

### Edge Functions

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/functions/v1/get-complaint` | POST | Yes (JWT) | Fetch complaint details by ID |

### Get Complaint

Retrieves detailed information about a specific complaint. **Restricted to Main Administrators only.**

**Request:**
```json
{
  "complaintId": "uuid-of-complaint"
}
```

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "device_type": "string",
  "device_serial_number": "string",
  "damage_description": "string",
  "status": "submitted | in_progress | completed | awaiting_shipment | cancelled",
  "assigned_technician_id": "uuid | null",
  "diagnosis": "string | null",
  "repair_cost": "number | null",
  "service_notes": "string | null",
  ...
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - User is not a Main Administrator
- `404 Not Found` - Complaint not found
- `400 Bad Request` - Missing complaint ID

## 🔐 Authentication

The application uses Supabase Authentication with the following features:

- Email/Password sign-in and sign-up
- Password reset via email
- Remember me functionality
- Protected routes based on user roles

## 🚢 Deployment

### Via Lovable

1. Open [Lovable](https://lovable.dev/projects/e569bdca-1959-45fb-9c1e-460ae06bf4c9)
2. Click **Share → Publish**

### Custom Domain

1. Navigate to **Project → Settings → Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions

## 🔄 Development Workflow

### Making Changes via Lovable

Changes made in Lovable are automatically committed to the connected GitHub repository.

### Making Changes via IDE

1. Clone the repository
2. Make changes locally
3. Push to GitHub
4. Changes sync automatically to Lovable

## 📝 Environment Variables

The application uses Supabase for backend services. The following are configured automatically:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the project administrator or open an issue in the GitHub repository.

---

Built with ❤️ using [Lovable](https://lovable.dev)
