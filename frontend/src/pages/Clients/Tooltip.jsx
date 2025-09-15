import { Button, Flex, Input, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { commonActions } from "../../store/commonReducer";
import { api } from "../../lib/api";

export default function Tooltip({
  search,
  setSearch,
  selected,
  setSelected,
  setOpen,
  messageApi,
}) {
  const dispatch = useDispatch();

  const onDelete = async () => {
    dispatch(commonActions.setLoadig(true));
    try {
      await api.delete("/crm/clients", { data: { ids: selected } });
      dispatch(commonActions.deleteClients(selected));
      setSelected([]);
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(commonActions.logout());
      }
      console.log(err);
      messageApi.error(err?.response?.data?.message || "Помилка");
    } finally {
      dispatch(commonActions.setLoadig(false));
    }
  };

  return (
    <Flex justify="space-between">
      <Input
        placeholder="Пошук"
        style={{ width: "50%" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Flex gap={8}>
        {selected.length > 0 && (
          <>
            <Button type="default" onClick={() => setSelected([])}>
              Скасувати
            </Button>
            <Popconfirm
              title="Ви впевнені, що хочете видалити цих клієнтів?"
              onConfirm={onDelete}
            >
              <Button
                style={{
                  aspectRatio: 1,
                  padding: 0,
                  marginRight: 16,
                }}
                danger
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </>
        )}

        <Button type="primary" onClick={() => setOpen(true)}>
          Додати
        </Button>
      </Flex>
    </Flex>
  );
}
