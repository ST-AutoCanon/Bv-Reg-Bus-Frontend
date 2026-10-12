import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  useLocation,
  Navigate,
  Outlet
} from 'react-router-dom';
import { RootState } from "../../app/store";
const AuthGaurd: FC = () => {
  const userData:any = useSelector((state: RootState) => state.loginCredential.userData);
  const auth = { user: false };
  let location = useLocation();
  userData.role === "admin" || userData.role === "user" ? auth.user = true : auth.user = false;
  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/" state={{ from: location }} />;
  }
  return <Outlet />
}






export default AuthGaurd;