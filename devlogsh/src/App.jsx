import { Routes, Route } from "react-router";
import Header from './components/Header';
import Home from './pages/Home';
import UserPanel from './pages/UserPanel'
import SignUp from './pages/Signup'
import Write from './pages/Write'

function App() {
  
  return (
    <div className="bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText min-h-screen">
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserPanel />} />
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/write" element={<Write/>}/>
      </Routes>
      <div style={{ height: '40px' }} />
    </div>
  );
}

export default App;
