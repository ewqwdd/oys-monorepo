import { Button, Form, Input, Modal, Row } from "antd";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";
import { api } from "../../lib/api";

export default function AddTeacher({ isModalOpen, setIsModalOpen }) {
    const dispatch = useDispatch();

    const onFinish = (values) => {
        dispatch(commonActions.setLoadig(true));
        api.post("/crm/teachers", values).then(({data}) => {
            dispatch(commonActions.setLoadig(false));
            dispatch(commonActions.addTeacher(data));
            setIsModalOpen(false);
        }).catch((err) => {
            dispatch(commonActions.setLoadig(false));
            console.log(err);
        });
        setIsModalOpen(false);
    };

  return (
    <Modal
      title={"Add Teacher"}
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalOpen(false)}
      closable
    >
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        style={{ paddingTop: "20px" }}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true, message: "Name обов`язкове поле" }]}>
          <Input />
        </Form.Item>
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
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Phone обов`язкове поле" },
            { type: "phone", message: "Phone не корректний!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <Input />
        </Form.Item>
        <Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  );
}
