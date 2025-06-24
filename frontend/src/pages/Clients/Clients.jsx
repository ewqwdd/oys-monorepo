import { Button, Flex, Input, message, Spin, Table, Typography } from "antd";
import { useSelector } from "react-redux";
import { clientColumns } from "./clientColumns";
import { useMemo, useState } from "react";
import AddClientModal from "./AddClientModal";
import EditClientModal from "./EditClientModal";
import Tooltip from "./Tooltip";

const { Title } = Typography;
export default function Clients() {
  const clients = useSelector((state) => state.common?.clients);
  const [open, setOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();


  const filteredClients = useMemo(() => {
    return search.length > 0 ? clients.filter((client) =>
      client.name?.toLowerCase().includes(search.toLowerCase()) || client.email?.toLowerCase().includes(search.toLowerCase())
    ) : clients;
  }, [clients, search]);

  return (
    <div className="default_page">
      {contextHolder}
      <Title
        level={3}
        style={{
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Клієнти
      </Title>
      <Tooltip search={search} setSearch={setSearch} selected={selected} setSelected={setSelected} setOpen={setOpen} messageApi={messageApi} />
      <Table
        dataSource={filteredClients}
        columns={clientColumns(setCurrentClient, selected, setSelected)}
        style={{ marginTop: 24 }}
        onRow={(record) => ({
          onClick: () => selected.includes(record._id) ? setSelected(selected.filter(e => e !== record._id)) : setSelected([...selected, record._id])
        })}
      />
      <AddClientModal open={open} onClose={() => setOpen(false)} />
      <EditClientModal
        client={currentClient}
        onClose={() => setCurrentClient(null)}
      />
    </div>
  );
}
