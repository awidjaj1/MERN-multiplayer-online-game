import { themeOptions } from "./theme";
import { LoginPage } from "./scenes/login";
import { createTheme, responsiveFontSizes, ThemeProvider, CssBaseline } from "@mui/material";
import {BrowserRouter, Navigate, Routes, Route} from 'react-router-dom';
import { useSelector } from "react-redux";
import { HomePage } from "./scenes/home";


function App() {
  const theme = responsiveFontSizes(createTheme(themeOptions));
  const isAuth = Boolean(useSelector((state) => state.token));
  // console.log(isAuth);
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={isAuth? <HomePage />: <Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
