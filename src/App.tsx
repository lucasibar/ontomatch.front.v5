import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Outlet />
    </Box>
  )
}

export default App
