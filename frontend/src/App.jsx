import { Button, ConfigProvider, Layout, Spin } from "antd";
import "./App.css";
import Router from "./components/Router";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import MobSidebar from "./components/MobSidebar";
import Theme from "./theme";
import { useEffect } from "react";
import { api } from "./lib/api";
import { commonActions } from "./store/commonReducer";
import { useAuthCheck } from "./lib/hooks/useAuthCheck";
import { Toaster } from "react-hot-toast";

function App() {
  const loading = useSelector((state) => state.common.loading);
  const userAuth = !!useSelector((state) => state.common.user);
  const mounted = useSelector((state) => state.common.mounted);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get("/crm/init")
      .then((res) => {
        dispatch(commonActions.setUser(res.data));
      })
      .catch(() => {
        dispatch(commonActions.logout());
      })
      .finally(() => {
        dispatch(commonActions.setMounted(true));
        dispatch(commonActions.setLoadig(false));
      });
  }, []);

  useAuthCheck();

  if (!mounted)
    return (
      <ConfigProvider key={"config"} theme={Theme}>
        <Spin spinning={true} key={"spin"} className="global-spin" />
      </ConfigProvider>
    );

  return (
    <ConfigProvider theme={Theme} key={"config"}>
      <Spin spinning={!mounted || loading} key={"spin"} className="global-spin">
        {userAuth && <MobSidebar />}
        <Layout hasSider className={clsx("layout", userAuth && "userAuth")}>
          <Layout.Content className="full-height">
            <Router />
          </Layout.Content>
        </Layout>
      </Spin>
      <Toaster />
    </ConfigProvider>
  );
}

export default App;
