// import '../App.css';
const SearchBar = () => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex gap-4">
        <button className="bg-blue-200 text-blue-900 font-bold px-4 py-2 rounded-lg">
          Ask Question
        </button>
        <button className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg">
          Filter
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search here"
          className="pl-4 pr-10 py-2 rounded-lg bg-white text-black w-64"
        />
        <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
      </div>
    </div>
  );
};

export default SearchBar;