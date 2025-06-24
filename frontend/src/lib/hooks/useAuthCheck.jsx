import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

export const useAuthCheck = () => {
  const mounted = useSelector((state) => state.common.mounted);
  const userAuth = !!useSelector((state) => state.common.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (mounted && !userAuth && pathname !== "/") {
      navigate("/");
    } else if (mounted && userAuth && pathname === "/") {
      navigate("/home");
    }
  }, [mounted, userAuth, pathname]);
};
