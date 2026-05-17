import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { GlobalToast } from './shared/ui/GlobalToast'

function App() {
  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Outlet />
      <GlobalToast />
    </Box>
  )
}

export default App
