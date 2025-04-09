import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import AlarmIcon from '@mui/icons-material/Alarm';
import ErrorIcon from '@mui/icons-material/Error';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import ClearIcon from '@mui/icons-material/Clear';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Add global styles to hide default scrollbar
const globalStyles = `
  ::-webkit-scrollbar {
    display: none;
  }
  
  * {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Card data array for filtering
  const cardData = [
    { id: 1, title: "Khách hàng", icon: AccountCircleIcon, color: "green", path: "/member" },
    { id: 2, title: "Đăng kí hàng tháng", icon: BarChartIcon, color: "gold" },
    { id: 3, title: "Hết hạn trong 3 ngày", icon: AlarmIcon, color: "red" },
    { id: 4, title: "Hết hạn trong 4-7 ngày", icon: AlarmIcon, color: "red" },
    { id: 5, title: "Đã hết hạn", icon: ErrorIcon, color: "red" },
    { id: 6, title: "Khách hàng không hoạt động", icon: PersonOffIcon, color: "gray" },
    { id: 7, title: "Huấn luyện viên", icon: FitnessCenterIcon, color: "blue" },
    { id: 8, title: "Check-in", icon: CheckCircleIcon, color: "green" }
  ];
  
  // Handle search input changes
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Clear search field
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  // Handle card click
  const handleCardClick = (card) => {
    if (card.path) {
      navigate(card.path);
    }
  };
  
  // Filter cards based on search term
  const filteredCards = cardData.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='ml-[25%] w-3/4 text-black p-5 relative'>
        {/* Add style tag to inject global styles */}
        <style>{globalStyles}</style>
        
        {/* Search bar */}
        <div className='w-full bg-slate-900 text-white rounded-lg flex p-3 justify-between items-center'>
            <div className="flex items-center w-full">
              <SearchIcon className="mr-2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-slate-800 text-white px-3 py-1 rounded flex-grow outline-none"
              />
              {searchTerm && (
                <ClearIcon 
                  className="cursor-pointer ml-2" 
                  onClick={clearSearch}
                />
              )}
            </div>
        </div>
        
        {/* Card display area */}
        <div className='mt-5 pt-3 bg-slate-100 bg-opacity-50 grid gap-5 grid-cols-3 w-full pb-5 overflow-x-auto h-[80%]'>
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <div 
                key={card.id} 
                className='w-full h-48 border-2 bg-white rounded-lg cursor-pointer'
                onClick={() => handleCardClick(card)}
              >
                <div className='h-3 rounded-t-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'></div>
                <div className='h-[calc(100%-0.75rem)] py-7 px-5 flex flex-col justify-center items-center w-full text-center rounded-b-lg hover:bg-slate-900 hover:text-white'>
                  {React.createElement(card.icon, { sx: { color: card.color, fontSize: "50px" } })}
                  <p className='text-xl my-3 font-semibold font-mono'>{card.title}</p>
                </div>
              </div>
            ))
          ) : (
            <div className='col-span-3 text-center py-10'>
              <p className='text-xl text-gray-500'>No matching results found</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default Dashboard;