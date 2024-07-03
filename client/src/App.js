import { themeOptions } from "./theme";
import { LoginPage } from "./scenes/login";
import { createTheme, responsiveFontSizes, ThemeProvider, CssBaseline } from "@mui/material";
import {BrowserRouter, Navigate, Routes, Route, useLocation} from 'react-router-dom';
import { useSelector } from "react-redux";
import { HomePage } from "./scenes/home";
import { SettingsPage } from "./scenes/userSettings";
import { GamePage } from "./scenes/game";


function App() {
  const theme = responsiveFontSizes(createTheme(themeOptions));
  const isAuth = Boolean(useSelector((state) => state.token));
  const loc = useLocation();
  console.log(loc);
  // console.log(isAuth);
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <Routes>
            <Route path="/" element={!isAuth? <LoginPage />: <Navigate to="/home" />} />
            <Route path="/home" element={isAuth? <HomePage />: <Navigate to="/" />} /> 
            <Route path="/settings" element={isAuth? <SettingsPage />: <Navigate to="/" />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
