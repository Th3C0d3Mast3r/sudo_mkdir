import Button from '../toolkit/Button.jsx';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-blue-900 text-white rounded-md mb-4">
      <h1 className="text-3xl font-header">StackIt</h1>
      <Button />
    </nav>
  );
};

export default Navbar;