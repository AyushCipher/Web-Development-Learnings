import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import RootLayout from './layout/RootLayout';
import ContactLayout from './layout/ContactLayout';
import './App.css';
import Contactinfo from './components/Contactinfo';
import ContactForm from './components/ContactForm';
import NotFound from './components/NotFound';
import JobsLayout from './layout/JobsLayout';
import Jobs, { jobsLoader } from './pages/Jobs';
import { jobDetailsLoader } from './components/JobDetails';
import JobDetails from './components/JobDetails';
import Error from './components/Error';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        {/* The index keyword defines the default child route when no specific path is provided. */}
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />

        <Route path="contact" element={<ContactLayout />}>
          <Route path="info" element={<Contactinfo />} />
          <Route path="form" element={<ContactForm />} />
        </Route>

        <Route path="jobs" element={<JobsLayout/>} errorElement={<Error/>}>
          <Route index element={<Jobs />} loader={jobsLoader} />
          <Route path=":id" element={<JobDetails/>} loader={jobDetailsLoader} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

export default App;

// Check out The Tutorial At: https://www.youtube.com/watch?v=943D7U74_sQ&t=607s
// npx json-server --watch data.json --port 4000


// REACT ROUTER:

// React Router is a standard routing library for React. It enables you to create single-page applications (SPAs) with navigation, 
// without reloading the entire page.

// It allows you to define routes in your app and render different components based on the current URL, 
// making your app feel like a multi-page website.

// React by default does not have routing support. You need React Router to:
// * Navigate between different pages/views (e.g., /home, /about)
// * Pass data between pages (via params or query strings)
// * Manage browser history
// * Handle protected/private routes
// * Support nested and dynamic routes


// IMPORTANT COMPONENTS(TAGS) IN REACT ROUTER:

// 1. <BrowserRouter> - Wraps your application and enables routing using HTML5 history API.

// 2. <Routes> and <Route> - Defines the routing structure and maps URL paths to components.

// 3. <Link> and <NavLink> - Used to navigate between pages without reloading the page.

// 4. <Navigate> - Used to programmatically redirect the user.

// 5. useNavigate() - Hook to navigate programmatically.

// 6. Nested Routes - You can define routes inside other routes.


// 7. loader - A loader is a special function used for data fetching before rendering a route.
// It:
// * Fetches data before the component renders.
// * Ensures that the component has the required data ready when it loads.
// * Helps in creating data-driven routes without manual useEffect or axios calls inside the component.


// 8. Route Parameter:- useParams is a React Router hook used to access the URL parameters in a component rendered by a route.

// Use useParams() when you need to:

// * HAccess dynamic route parameters (e.g., /product/:id, /user/:username)
// * HFetch specific data based on URL (e.g., GET /products/5)
// * HDisplay detailS of an item selected via its ID or slug