import { Routes, Route } from "react-router";
import Header from './components/Header';
import Home from './pages/Home';
import UserPanel from './pages/UserPanel'
function App() {

  return (
    <div className="bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen">
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserPanel />} />
      </Routes>
    </div>
  );
}

export default App;
