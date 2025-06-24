import { Button, Col, DatePicker, Flex, Row, Spin, Switch, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../lib/api";
import { commonActions } from "../../store/commonReducer";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { formatMinutes } from "../../lib/helpers/minutesToString";
import MeetDetailsModal from "../../components/MeetDetailsModal";
import AddMeetModal from "../../components/AddMeetModal";
import { timeToMinutes } from "../../lib/helpers/timeToMinutes";

const { Title, Text } = Typography;
const dateFormat = "YYYY/MM/DD";
const { RangePicker } = DatePicker;

export default function Meets() {
  const [value, setValue] = useState([dayjs()]);
  const meets = useSelector((state) => state.common?.meets);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currentMeet, setCurrentMeet] = useState(null);
  const [meetModal, setMeetModal] = useState(false);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD.MM.YYYY"),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan) => (
        <Button variant="outlined">
          {formatMinutes(plan?.timeFrom ?? 0)} - {formatMinutes(plan?.timeTo ?? 0)}
        </Button>
      ),
    },
    {
      title: "Places",
      key: "places",
      render: (record) => (
        <Text>
          {record.clients.length} / {record.plan?.places ?? 1}
        </Text>
      ),
    },
    {
      title: "Teacher",
      dataIndex: "tutor",
      key: "tutor",
      render: (tutor) => (
        <Link to={`/teacher/${tutor._id}`}>
          <Button variant="link">{tutor.name}</Button>
        </Link>
      ),
    },
    {
      title: "Details",
      key: "_id",
      render: (record) => (
        <Button onClick={() => setCurrentMeet(record)} type="primary">
          Деталі
        </Button>
      ),
    },
  ];

  const onClose = () => setCurrentMeet(null);

  useEffect(() => {
    if (meets) return;
    setLoading(true);
    api
      .get("/crm/meets")
      .then(({ data }) => {
        dispatch(commonActions.setMeets(data.sort((a, b) => a.plan?.timeFrom - b.plan?.timeFrom)));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [meets]);

  const filteredMeets = meets?.filter((meet) => {
    if (!value) return true;
    const isBefore = !value[1] || dayjs(meet.date).isBefore(value[1].add(1, "day"));
    const isAfter = !value[0] || dayjs(meet.date).isAfter(value[0].subtract(1, "day"));
    return isAfter && isBefore;
  }).sort((a, b) => dayjs(a.date).isAfter(b.date) ? -1 : 1);

  return (
    <div className="default_page">
      <Title
        level={3}
        style={{
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Зустрічі
      </Title>
      <Spin spinning={loading}>
      <Flex justify="space-between">
        <RangePicker
          format={dateFormat}
          value={value}
          onChange={(v) => setValue(v)}
          style={{ width: "50%" }}
        />
        <Button type="primary" onClick={() => setMeetModal(true)}>
          Додати
        </Button>
        </Flex>
        <Table pagination={{
          pageSize: 10
        }} dataSource={filteredMeets} columns={columns} style={{ marginTop: 24 }} />
      </Spin>
      <MeetDetailsModal meet={currentMeet} open={!!currentMeet} onClose={onClose} />
      <AddMeetModal open={meetModal} onClose={() => setMeetModal(false)} />
    </div>
  );
}
