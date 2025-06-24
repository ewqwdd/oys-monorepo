import {
  Button,
  Collapse,
  Flex,
  Input,
  message,
  Modal,
  Spin,
  Typography,
} from "antd";
import { DeleteFilled, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useDispatch } from "react-redux";
import { commonActions } from "../store/commonReducer";
const { Link } = Typography;

export default function MeetDetailsModal({ open, onClose, meet }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const dispatch = useDispatch();
  const [clients, setClients] = useState(meet?.clients);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    messageApi.success("Скопійовано");
  };

  useEffect(() => {
    if (meet) {
      setLoading(true);
      api
        .get("/crm/meetLink/" + meet._id)
        .then(({ data }) => {
          setLink(data?.link);
        })
        .finally(() => setLoading(false));
    }
  }, [meet]);

  useEffect(() => {
    setClients(meet?.clients);
  }, [meet]);

  const onDelete = async (id) => {
    dispatch(commonActions.setLoadig(true));
    try {
      await api.delete("/crm/meets/" + meet._id + '/clients/' + id);
      dispatch(commonActions.deleteClientFromMeet({ meetId: meet._id, clientId: id }));
      setClients(clients.filter((client) => client._id !== id));
      messageApi.success("Клієнта видалено");
    } catch (err) {
      console.log(err);
      messageApi.error(err?.response?.data?.message || "Помилка");
    } finally {
      dispatch(commonActions.setLoadig(false));
    }
  }
  
  return (
    <>
      {contextHolder}
      <Modal
        title="Zoom конференція"
        open={open}
        onCancel={onClose}
        footer={null}
        style={{
          maxWidth: 300,
        }}
      >
        <Spin spinning={loading}>
          <Flex vertical gap={16} align="center">
            <img src="/zoom.svg" alt="zoom" style={{ width: 100 }} />
            <Flex gap={8} align="center" vertical>
              <Input disabled value={link} style={{ maxWidth: 140 }} />
              <Flex gap={8}>
                <Button type="primary" href={link} target="_blank">
                  Пперейти
                </Button>
                <Button onClick={() => copy(link)}>Копіювати</Button>
              </Flex>
            </Flex>
            <Collapse
              style={{
                width: "100%",
              }}
              size="small"
              items={[
                {
                  key: "1",
                  label: "Клієнти",
                  children: (
                    <Flex vertical gap={4}> 
                      {clients?.map((client) => (
                        <Flex align="center" gap={16}>
                          <Button type="primary" variant="filled" shape="circle" danger style={{ padding: 0, minWidth: 24, height: 24 }} onClick={() => onDelete(client._id)}>
                            <DeleteOutlined />
                          </Button>
                        <p key={client._id}>
                          <UserOutlined size={12} /> {client.name}{" "}
                          <Link href={`mailto:${client.email}`}>
                            {client.email}
                          </Link>
                        </p>
                        </Flex>
                      ))}
                    </Flex>
                  ),
                },
              ]}
            />
          </Flex>
        </Spin>
      </Modal>
    </>
  );
}
