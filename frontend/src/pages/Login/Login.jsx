import { Menu } from "antd";
import { MailOutlined, UserAddOutlined } from "@ant-design/icons";
import RegisterForm from "./RegisterForm";
import { useState } from "react";
import LoginForm from "./LoginForm";

export default function Login() {
  const [tab, setTab] = useState("login");

  const onTypeClick = ({ key }) => {
    setTab(key);
  };

  return (
    <div className="auth_page default_page">
      <div
        style={{
          background: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <Menu
          className="menu"
          onClick={onTypeClick}
          selectedKeys={[tab]}
          mode="horizontal"
        >
          <Menu.Item key="login" icon={<MailOutlined />}>
            Login
          </Menu.Item>
          <Menu.Item key="register" icon={<UserAddOutlined />}>
            Register
          </Menu.Item>
        </Menu>
        {tab === "login" && <LoginForm />}
        {tab === "register" && <RegisterForm />}
      </div>
    </div>
  );
}
