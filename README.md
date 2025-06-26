Devlog is a modern, full-stack collaborative developer focussed blogging platform built with a strong emphasis on user experience, customizability, and adherence to contemporary software development best practices. It enables developers and writers to publish content, connect with others, and personalize their experience through a refined and intuitive interface.

![brand image](https://github.com/user-attachments/assets/8ec37601-5bef-492b-824b-3e6a5226e1ea)

## Features

### Authentication and Authorization

* Implements a custom JSON Web Token (JWT)-based authentication system with secure password hashing.
* Supports Google OAuth for convenient third-party sign-in.

### User Profiles and Social Functionality

* Each user has a public profile displaying an avatar, username, biography, post count, average post rating, and social metrics.
* Avatars can be uploaded and updated via Supabase Storage with support for real-time synchronization.
* Users can follow or unfollow others, and interact via comments and post ratings.
* Comments are structured in a threaded format with support for nested replies.
* A "Users to follow" section is presented contextually to enhance networking opportunities.

### Post Creation and Markdown Editor

* Includes a custom-built Markdown editor supporting:

  * Headings, text styling (bold, italic, underline, strikethrough), code blocks, syntax highlighting
  * Link insertion, color highlights, and embedded images
* Image uploads are integrated with Supabase Storage.
* Posts can be edited, updated, and saved with SEO-friendly metadata.

### Search and Discovery

* A global search bar is available in the site header for real-time search of users and posts.
* Users have access to:

  1. **For You Feed** – A personalized content feed based on user activity.
  2. **Trending Feed** – Displays the most popular or highest-rated posts on the platform.

---

## Architecture and Technical Highlights

* Utilizes a normalized PostgreSQL schema optimized for scalability, with structured tables for users, posts, comments, followers, and feedback.
* Leverages Supabase for efficient and scalable real-time file handling.
* Backend includes comprehensive error handling and consistent HTTP status responses.
* Developed using a modern, modular codebase aligned with industry best practices.

---

## Getting Started

### Installation

```bash
git clone https://github.com/sameersharmadev/devlog.git
cd devlog
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file in the \backend directory with the following variables:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```
Create a `.env` file in the \devlogsh directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### Running the Application

```bash
npm run dev
# or
yarn dev
```

Then open your browser at `http://localhost:5173` to access the application.

## Live Demo

You can also try Devlog here: [devlog.sameersharma.me](https://devlog.sameersharma.me/)

---

## Contributing

Contributions are welcome and encouraged. To contribute:

```bash
git checkout -b feature/your-feature-name
```

Please ensure your pull requests are well-documented and tested where applicable.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

## Acknowledgements

* Supabase (for real-time backend and file storage)
* PostgreSQL
* React
* MDX (Milkdown based markdown editor)
  
---

Devlog is an open-source platform created with the goal of making blogging more accessible, interactive, and developer-friendly.
