import WorkList from './WorkList';
import WorkDetail from './WorkDetail';
import NotFound from './NotFound';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/" element={<WorkList />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
} 


export default App;