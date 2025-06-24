import { Button, Form, Input, Row } from "antd";
import { useEffect } from "react";

export default function AddClient({ onSubmit, onDelete, initialValues }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [initialValues]);

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onSubmit}
      autoComplete="off"
      style={{ padding: "20px" }}
      form={form}
    >
      <Form.Item
        label="Ім'я"
        name="name"
        rules={[{ required: true, message: "Виберіть ім'я" }]}
      >
        <Input placeholder="Введіть ім'я" />
      </Form.Item>

      <Form.Item
        label="Пошта"
        name="email"
        rules={[{ required: true, message: "Виберіть пошту", type: "email", pattern: /^\S+@\S+\.\S+$/ }]}
      >
        <Input placeholder="Введіть пошту" />
      </Form.Item>

      <Form.Item
        label="Телефон"
        name="phone"
        rules={[
          { required: true, message: "Виберіть телефон" },
          {
            pattern: /^\+380\d{9}$/,
            message: "Введіть телефон у форматі +380XXXXXXXXX",
          },
        ]}
      >
        <Input placeholder="Введіть телефон у форматі +380XXXXXXXXX" />
      </Form.Item>

      <Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {onDelete ? 'Зберегти' : 'Підтвердити'}
          </Button>
        </Form.Item>
        {onDelete && (
          <Button
            type="default"
            color="danger"
            htmlType="button"
            style={{ marginLeft: "10px" }}
            onClick={onDelete}
          >
            Видалити
          </Button>
        )}
      </Row>
    </Form>
  );
}
