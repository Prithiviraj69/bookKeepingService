# Bookkeeping Service

A full-featured bookkeeping service API and web application for managing books, libraries, and borrowing. This application allows authors to add books, libraries to maintain inventories, and borrowers to borrow and return books.

## Features

- **User Management**:
  - User registration and authentication
  - Role-based access control (Author, Borrower, Admin)
  - JWT-based authentication
  - User profiles with language preferences

- **Book Management**:
  - Create, read, update, and delete books
  - Upload book cover images (stored in Cloudinary)
  - Track book borrowing status

- **Library Management**:
  - Create, read, update, and delete libraries
  - Manage library inventories
  - Add and remove books from libraries

- **Borrowing System**:
  - Borrow books with automatic return date calculation
  - Return borrowed books
  - Track borrowing history

- **Multilingual Support**:
  - API responses in English and Hindi
  - User interface in English and Hindi
  - User-selectable language preference

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - Multer for file uploads

- **Frontend**:
  - EJS templating engine
  - Vanilla JavaScript
  - CSS3 with responsive design

- **Storage**:
  - Cloudinary for image storage
  - Local file storage as fallback

- **Other**:
  - bcryptjs for password hashing
  - dotenv for environment variables
  - colors for console output styling

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

