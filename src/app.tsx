import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from './components/layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Wishlist from './pages/Wishlist';
import BookDetails from './pages/BookDetails';

function App() {
  return (
    <BrowserRouter>
      {/* Global Toast could be controlled by a provider, but for now pages handle their own UI or we use a Toaster component */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="book/:id" element={<BookDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
