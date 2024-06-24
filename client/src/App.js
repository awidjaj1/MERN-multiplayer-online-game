import { themeOptions } from "./theme";
import { LoginPage } from "./scenes/login";
import { createTheme, responsiveFontSizes, ThemeProvider, CssBaseline } from "@mui/material";
import {BrowserRouter, Navigate, Routes, Route} from 'react-router-dom';


function App() {
  const theme = responsiveFontSizes(createTheme(themeOptions));
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<div>Hi</div>} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
