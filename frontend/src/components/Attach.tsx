import { CopyPlus } from 'lucide-react';

const Attach = () => {
  return (
    <button
      type="button"
      className="p-2 text-gray-400 hover:text-white transition duration-200 bg-[#3a3a3a] rounded-full hover:bg-[#4a4a4a]"
    >
      <CopyPlus size={20} />
    </button>
  );
};

export default Attach;