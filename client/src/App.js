import { themeOptions } from "./theme";
import { LoginPage } from "./scenes/login";
import { createTheme, responsiveFontSizes, ThemeProvider, CssBaseline } from "@mui/material";

function App() {
  const theme = responsiveFontSizes(createTheme(themeOptions));
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <LoginPage />
      </ThemeProvider>
    </div>
  );
}

export default App;
