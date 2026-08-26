# Ayush Verma — Portfolio

Personal portfolio website built with React and Vite, showcasing projects, experience, and skills as a Software Developer / AI-ML Engineer.

**Live site:** https://latest-portfolio-wrcc.onrender.com/

## Features

- Animated hero, about, experience, projects, skills, and testimonials sections
- Custom cursor, particle background, and intro animation
- Background music player
- Contact form powered by EmailJS
- Downloadable resume (PDF)

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- Framer Motion, GSAP, Locomotive Scroll
- EmailJS (contact form)

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.template` to `.env` and fill in your EmailJS credentials before using the contact form:

```
VITE_SERVICE_ID=
VITE_TEMPLATE_ID=
VITE_PUBLIC_KEY=
```

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Project Structure

```
src/
  assets/       images and media
  components/   Navbar, MusicPlayer, CustomCursor, etc.
  sections/     Home, About, Experience, Projects, Skills, Testimonials, Contact, Footer
public/
  Resume.pdf    downloadable resume
```
