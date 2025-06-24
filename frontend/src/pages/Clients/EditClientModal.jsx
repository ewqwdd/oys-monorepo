import { message, Modal, Spin } from "antd";
import AddClient from "../../components/AddClient";
import { api } from "../../lib/api";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";

export default function EditClientModal({ client, onClose }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = (values) => {
    setLoading(true);
    api
      .put(`/crm/clients/${client._id}`, values)
      .then((res) => {
        messageApi.success("Клієнт доданий");
        dispatch(commonActions.editClient(res.data));
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

  const deleteClient = () => {
    setLoading(true);
    api
      .delete(`/crm/clients/${client._id}`)
      .then(() => {
        messageApi.success("Клієнт видалений");
        dispatch(commonActions.deleteClient(client._id));
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
        open={client}
        title={"Додати клієнта"}
      >
        <Spin spinning={loading}>
          <AddClient
            onDelete={deleteClient}
            initialValues={client}
            onSubmit={onSubmit}
          />
        </Spin>
      </Modal>
    </>
  );
}
