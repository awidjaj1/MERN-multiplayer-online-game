import { themeOptions } from "./theme";
import { createTheme, responsiveFontSizes, ThemeProvider, CssBaseline } from "@mui/material";

function App() {
  const theme = responsiveFontSizes(createTheme(themeOptions));
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        Hello World!
      </ThemeProvider>
    </div>
  );
}

export default App;
