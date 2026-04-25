import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Login from "./pages/Login"
import { Toaster } from "react-hot-toast"
import ProtectedRoutes from "./components/protectedRoutes"
import PublicRoutes from "./components/publicRoutes"
import SelectRole from "./pages/SelectRole"
import Navbar from "./components/navbar"
import AccountPage from "./pages/AccountPage"
import Restaurant from "./pages/Restaurant"

const App = () => {




  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />}></Route>
          </Route>

          <Route element={<ProtectedRoutes />} >
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/select-role" element={<SelectRole />}></Route>
            <Route path="/my-account" element={<AccountPage />}></Route>
            <Route path="/my-restaurant" element={<Restaurant />}></Route>

            {/* <Route element={<Navbar />} ></Route>  */}
          </Route>

        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  )
}

export default App