// import * as React from "react";
// import { Global, CacheProvider } from "@emotion/react";
// import { ChakraProvider, Box, extendTheme } from "@chakra-ui/react";
// import createCache from "@emotion/cache";
// import Header from "./components/header";
// import Footer from "./components/footer";
// import Login from "./components/Auth/login";
// import Prompt from "./components/Auth/prompt";
// import Home from "./components/home";
// import About from "./components/about";
// import Dashboard from "./components/homologation";
// import BusHomologation from "./components/homologation/BusHomologation";
// import Homologation from "./components/supplier";
// import WMI from "./components/WMI/barrelDataForm";
// import theme from "./theme";
// import AuthGaurd from "./components/Auth/authgaurd";
// import {
//   Routes,
//   Route,
//   useParams,
//   Navigate,
//   useNavigate,
// } from "react-router-dom";
// import SearchUserOrHomologation from "./components/search/searchRegisterUserOrHomologation";
// import NewSignin from "./components/Auth/updatepassword";
// import { useSelector } from "react-redux";
// import { RootState } from "../src/app/store";
// import ResetPassword from "./components/Auth/resetPassword";

// import BusDashboard from "./components/homologation/bus/pages/Dashboard";
// import RequestDetails from "./components/homologation/bus/pages/Details";
// const emotionCache = createCache({
//   key: "emotion-css-cache",
//   prepend: true, // ensures styles are prepended to the <head>, instead of appended
// });
// //////

// const RequestDetailsWrapper = () => {
//   const { submissionId } = useParams<{ submissionId: string }>();
//   const navigate = useNavigate();

//   if (!submissionId) {
//     return <p>Request ID is missing.</p>;
//   }

//   return (
//     <RequestDetails
//       submissionId={submissionId}
//       onClose={() => navigate("/BusDashboard")}
//       onSaved={() => {
//         // Optional: refresh data after saving
//       }}
//     />
//   );
// };

// export const App = () => {
//   const navigate = useNavigate();
//   const userData: any = useSelector(
//     (state: RootState) => state.loginCredential.userData,
//   );

//   return (
//     <CacheProvider value={emotionCache}>
//       <ChakraProvider theme={theme}>
//         <Box minH="100vh" display="flex" flexDirection="column">
//           {/* Header */}
//           <Header />

//           {/* Main Content */}
//           <Box flex="1">
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/Login" element={<Login />} />

//               {userData.role === "user" ? (
//                 <Route element={<AuthGaurd />}>
//                   <Route path="/Dashboard" element={<Dashboard />} />
//                   <Route path="/Homologation" element={<Homologation />} />
//                   <Route
//                     path="/BusHomologation"
//                     element={<BusHomologation />}
//                   />
//                   {/* <Route
//                     path="/BusDashboard"
//                     element={<BusDashboard />} /> */}
//                   <Route path="/BusDashboard" element={<BusDashboard />} />
//                   {/* =====================================================
//               REQUEST DETAILS

//               Opens Details as a FULL PAGE, not a popup.

//               Example:
//               /requests/68f123abc456
//           ====================================================== */}
//                   {/* 
//                   <Route
//                     path="/requests/:submissionId"
//                     element={
//                       <RequestDetails
//                         submissionId=""
//                         onClose={() => navigate("/dashboard")}
//                         onSaved={() => {}}
//                       />
//                     }
//                   /> */}

//                   <Route
//                     path="/requests/:submissionId"
//                     element={<RequestDetailsWrapper />}
//                   />

//                   <Route
//                     path="/SearchUserOrHomologation"
//                     element={<SearchUserOrHomologation />}
//                   />
//                   <Route path="/WMI" element={<WMI />} />
//                 </Route>
//               ) : (
//                 <Route element={<AuthGaurd />}>
//                   <Route path="/Homologation" element={<Homologation />} />
//                   <Route
//                     path="/SearchUserOrHomologation"
//                     element={<SearchUserOrHomologation />}
//                   />
//                 </Route>
//               )}

//               <Route path="/NewSignin/*" element={<NewSignin />} />
//               <Route path="/ResetPassword/*" element={<ResetPassword />} />
//               <Route path="/About" element={<About />} />
//             </Routes>
//           </Box>

//           {/* Footer */}
//           <Footer />
//         </Box>
//       </ChakraProvider>
//     </CacheProvider>
//   );
// };




import * as React from "react";
import { CacheProvider } from "@emotion/react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import createCache from "@emotion/cache";

import Header from "./components/header";
import Footer from "./components/footer";
import Login from "./components/Auth/login";
import Home from "./components/home";
import About from "./components/about";
import Dashboard from "./components/homologation";
import BusHomologation from "./components/homologation/BusHomologation";
import Homologation from "./components/supplier";
import WMI from "./components/WMI/barrelDataForm";
import theme from "./theme";
import AuthGaurd from "./components/Auth/authgaurd";

import {
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";

import SearchUserOrHomologation from "./components/search/searchRegisterUserOrHomologation";
import NewSignin from "./components/Auth/updatepassword";
import { useSelector } from "react-redux";
import { RootState } from "../src/app/store";
import ResetPassword from "./components/Auth/resetPassword";

import BusDashboard from "./components/homologation/bus/pages/Dashboard";
import RequestDetails from "./components/homologation/bus/pages/Details";

const emotionCache = createCache({
  key: "emotion-css-cache",
  prepend: true,
});

const RequestDetailsWrapper = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  if (!submissionId) {
    return <p>Request ID is missing.</p>;
  }

  return (
    <RequestDetails
      submissionId={submissionId}
      onClose={() => navigate("/BusDashboard")}
      onSaved={() => {
        // Optional: refresh data after saving
      }}
    />
  );
};

export const App = () => {
  const userData: any = useSelector(
    (state: RootState) => state.loginCredential.userData,
  );

  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={theme}>
        <Box minH="100vh" width="100%" display="flex" flexDirection="column" overflow="hidden">
          {/* Header */}
          <Box width="100%" flexShrink={0}>
            <Header />
          </Box>

          {/* Main Content */}
         <Box
  as="main"
  width="100%"
  flex="1"
  minHeight={0}
  minWidth={0}
  overflow="hidden"
  display="flex"
  flexDirection="column"
>
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

                  <Route path="/BusDashboard" element={<BusDashboard />} />

                  <Route
                    path="/requests/:submissionId"
                    element={<RequestDetailsWrapper />}
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

          {/* Footer: remains after content */}
          <Box
            as="footer"
            width="100%"
            flexShrink={0}
            position="relative"
            zIndex={10}
          >
            <Footer />
          </Box>
        </Box>
      </ChakraProvider>
    </CacheProvider>
  );
};
