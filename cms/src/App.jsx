import { Routes, Route } from "react-router";
import "toastify-js/src/toastify.css";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";


function App() {
  return <>
  <Routes>
    <Route element={<AuthLayout/>}>
      <Route></Route>
    </Route>
    <Route element={<MainLayout/>}>
      <Route></Route>
    </Route>
  </Routes>
  </>;
}

export default App;
