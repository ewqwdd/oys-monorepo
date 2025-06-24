import { Button, Checkbox, Form, Input } from "antd";
import axios from "axios";
import React from "react";
import { api } from "../../lib/api";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";

export default function LoginForm() {
  const dispatch = useDispatch();

  const onFinish = ({ email, password, remember }) => {
    dispatch(commonActions.setLoadig(true));
    axios
      .post(import.meta.env.VITE_API + "/crm/login", { email, password })
      .then(({ data }) => {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        api
          .get("/crm/init")
          .then((res) => {
            dispatch(commonActions.setUser(res.data));
            dispatch(commonActions.setLoadig(false));
          })
          .catch((err) => {
            dispatch(commonActions.setLoadig(false));
            console.log(err);
          });
      })
      .catch((err) => {
        dispatch(commonActions.setLoadig(false));
        console.log(err);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      style={{ paddingTop: "20px" }}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Email обов`язкове поле" },
          { type: "email", message: "Email не корректний!" },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Пароль обов`язкове поле" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
