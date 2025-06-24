import { Button, Layout, Menu, Typography } from "antd";
import { gray, orange } from "@ant-design/colors";
import {
  CalendarOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  PushpinOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { uiActions } from "../store/uiReducer";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { commonActions } from "../store/commonReducer";

export default function MobSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.common.user?.role === "user");

  const handleCollapse = (collapsed) => {
    dispatch(uiActions.setMobSidebar(collapsed));
  };

  const { Title, Paragraph } = Typography;

  const { pathname } = useLocation();

  const logout = () => {
    dispatch(commonActions.logout());
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <Layout.Sider
      breakpoint="lg"
      collapsedWidth="0"
      className="sidebar"
      width={300}
      collapsed={false}
      style={{ position: "fixed", zIndex: 100 }}
      onCollapse={handleCollapse}
      trigger={
        <Button
          style={{ background: "transparent", color: gray[1], border: "none" }}
          icon={<MenuOutlined />}
        />
      }
    >
      <Title
        level={1}
        style={{
          color: "white",
          textAlign: "center",
          marginTop: 10,
          fontSize: 72,
          lineHeight: "72px",
          marginBottom: 0,
        }}
      >
        9Z
      </Title>
      <Paragraph
        style={{
          color: orange[6],
          textAlign: "center",
          fontSize: 32,
          marginTop: -10,
          marginBottom: 12,
          fontWeight: 700,
        }}
      >
        CRM
      </Paragraph>

      <Menu selectedKeys={[pathname]} theme="dark">
        <Menu.Item key="/home" icon={<HomeOutlined />}>
          <Link to="/home">Home</Link>
        </Menu.Item>
        {isAdmin ? (
          <>
            <Menu.Item key="/teachers" icon={<InfoCircleOutlined />}>
              <Link to="/teachers">Teachers</Link>
            </Menu.Item>
            <Menu.Item key="/meets" icon={<CalendarOutlined />}>
              <Link to="/meets">Meets</Link>
            </Menu.Item>
            <Menu.Item key="/clients" icon={<UserOutlined />}>
              <Link to="/clients">Clients</Link>
            </Menu.Item>
            <Menu.Item key="/photos" icon={<PushpinOutlined />}>
              <Link to="/photos">Фотокарточки</Link>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="/meets" icon={<CalendarOutlined />}>
              <Link to="/meets">Meets</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
      <Button
        type="text"
        onClick={logout}
        style={{
          color: "white",
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "start",
          height: 40,
        }}
      >
        <UserDeleteOutlined />
        Вийти
      </Button>
    </Layout.Sider>
  );
}
