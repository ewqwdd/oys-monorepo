import { message, Modal, Spin } from "antd";
import AddClient from "../../components/AddClient";
import { api } from "../../lib/api";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";

export default function AddClientModal({ open, onClose }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = (values) => {
    setLoading(true);
    api
      .post("/crm/clients", values)
      .then((res) => {
        messageApi.success("Клієнт доданий");
        dispatch(commonActions.addClient(res.data));
        onClose();
      })
      .catch((err) => {
        messageApi.error(err?.response?.data?.message || "Помилка");
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        footer={null}
        closable
        onCancel={onClose}
        open={open}
        title={"Додати клієнта"}
      >
        <Spin spinning={loading}>
          <AddClient onSubmit={onSubmit} />
        </Spin>
      </Modal>
    </>
  );
}
