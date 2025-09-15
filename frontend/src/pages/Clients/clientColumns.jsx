import { Button, Checkbox, Flex, Typography } from "antd";

const { Text } = Typography;

export const clientColumns = (setClient, selected, setSelected) => [
  {
    title: "Ім'я",
    key: "name",
    render: (record) => (
      <Flex gap={24}>
        <Checkbox checked={selected.find((e) => e === record._id)} />
        <Button variant="outlined">{record.name ?? "Не вказано"}</Button>
      </Flex>
    ),
  },
  {
    title: "Телефон",
    key: "phone",
    dataIndex: "phone",
    render: (phone) => <Text>{phone ?? "Не вказано"}</Text>,
  },
  {
    title: "Пошта",
    key: "email",
    dataIndex: "email",
    render: (email) => <a href={`mailto:${email}`}>{email ?? "Не вказано"}</a>,
  },
  {
    title: "Дії",
    key: "actions",
    render: (record) => (
      <Button
        type="primary"
        onClick={(e) => {
          e.stopPropagation();
          setClient(record);
        }}
      >
        Редагувати
      </Button>
    ),
  },
];
