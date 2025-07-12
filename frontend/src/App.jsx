import './App.css'
import Navbar from './Components/Navbar.jsx';
import SearchBar from './Components/Searchbar.jsx';
import QuestionCard from './Components/QuestionCard.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 p-6 text-white font-body">
      <Navbar />
      <SearchBar />
      <div className="space-y-4">
        <QuestionCard />
        <QuestionCard />
        <QuestionCard />
      </div>
    </div>
  );
}

export default App;
