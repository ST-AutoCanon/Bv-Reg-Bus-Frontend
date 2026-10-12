import * as React from "react"
import { Global, CacheProvider } from '@emotion/react'
import {
  ChakraProvider,
  Box,
  extendTheme
} from "@chakra-ui/react";
import createCache from '@emotion/cache';
import Header from "./components/header";
import Footer from "./components/footer";
import Login from "./components/Auth/login";
import Prompt from "./components/Auth/prompt";
import Home from "./components/home";
import About from "./components/about";
import Dashboard from "./components/homologation";
import BusHomologation from "./components/homologation/BusHomologation"
import Homologation from "./components/supplier";
import WMI from "./components/WMI/barrelDataForm";
import theme from "./theme";
import AuthGaurd from "./components/Auth/authgaurd";
import { Routes, Route, Navigate } from 'react-router-dom';
import SearchUserOrHomologation from "./components/search/searchRegisterUserOrHomologation";
import NewSignin from "./components/Auth/updatepassword";
import { useSelector } from 'react-redux';
import { RootState } from "../src/app/store";
import ResetPassword from "./components/Auth/resetPassword";
const emotionCache = createCache({
  key: 'emotion-css-cache',
  prepend: true, // ensures styles are prepended to the <head>, instead of appended
});
//////

export const App = () => {
  const userData: any = useSelector(
    (state: RootState) => state.loginCredential.userData
  );

  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={theme}>
        <Box minH="100vh" display="flex" flexDirection="column">

          {/* Header */}
          <Header />

          {/* Main Content */}
          <Box flex="1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Login" element={<Login />} />

              {userData.role === "user" ? (
                <Route element={<AuthGaurd />}>
                  <Route path="/Dashboard" element={<Dashboard />} />
                  <Route path="/Homologation" element={<Homologation />} />
                  <Route
                    path="/BusHomologation"
                    element={<BusHomologation />}
                  />
                  <Route
                    path="/SearchUserOrHomologation"
                    element={<SearchUserOrHomologation />}
                  />
                  <Route path="/WMI" element={<WMI />} />
                </Route>
              ) : (
                <Route element={<AuthGaurd />}>
                  <Route path="/Homologation" element={<Homologation />} />
                  <Route
                    path="/SearchUserOrHomologation"
                    element={<SearchUserOrHomologation />}
                  />
                </Route>
              )}

              <Route path="/NewSignin/*" element={<NewSignin />} />
              <Route path="/ResetPassword/*" element={<ResetPassword />} />
              <Route path="/About" element={<About />} />
            </Routes>
          </Box>

          {/* Footer */}
          <Footer />

        </Box>
      </ChakraProvider>
    </CacheProvider>
  );
};