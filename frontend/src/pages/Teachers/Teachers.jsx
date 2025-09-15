import { Button, InputNumber, Modal, Switch, Table, Typography } from "antd";
import { useCallback, useState } from "react";
import AddTeacher from "./AddTeacher";
import { useDispatch, useSelector } from "react-redux";
import TeacherExpandable from "../../components/TeacherExpandable/TeacherExpandable";
import { api } from "../../lib/api";
import { commonActions } from "../../store/commonReducer";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const { Title } = Typography;

export default function Teachers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const teachers = useSelector((state) => state.common?.teachers);
  const dispatch = useDispatch();

  const changeOrder = (order, id) =>
    api
      .post(`/crm/teachers/${id}/order`, { order })
      .then(({ data }) => {
        dispatch(commonActions.editTeacher(data));
      })
      .catch((e) => {
        toast.error(e.response.data.message);
        console.error(e);
      });

  const debouncedFetchOrder = useCallback(debounce(changeOrder, 500), []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Meets",
      dataIndex: "meets",
      key: "meets",
      render: (meets) => meets.length,
    },
    {
      title: "Published",
      key: "published",
      render: (record) => (
        <Switch
          checked={record.published}
          onChange={(e) => {
            api
              .post(`/crm/teachers/${record._id}/publish`, { published: e })
              .then(({ data }) => {
                dispatch(commonActions.editTeacher(data));
              })
              .catch((e) => {
                if (e.response?.status === 401) {
                  dispatch(commonActions.logout());
                }
                toast.error(e.response.data.message);
                console.error(e);
              });
          }}
        />
      ),
    },
    {
      title: "Slider",
      key: "slider",
      render: (record) => (
        <Switch
          checked={record.sliderVisible}
          onChange={(e) => {
            api
              .post(`/crm/teachers/${record._id}/sliderPublish`, {
                published: e,
              })
              .then(({ data }) => {
                dispatch(commonActions.editTeacher(data));
              })
              .catch((e) => {
                if (e.response?.status === 401) {
                  dispatch(commonActions.logout());
                }
                toast.error(e.response.data.message);
                console.error(e);
              });
          }}
        />
      ),
    },
    {
      title: "Beginner",
      key: "beginner",
      render: (record) => (
        <Switch
          checked={record.beginnerPublished}
          onChange={(e) => {
            api
              .post(`/crm/teachers/${record._id}/beginnerPublished`, {
                published: e,
              })
              .then(({ data }) => {
                dispatch(commonActions.editTeacher(data));
              })
              .catch((e) => {
                if (e.response?.status === 401) {
                  dispatch(commonActions.logout());
                }
                toast.error(e.response.data.message);
                console.error(e);
              });
          }}
        />
      ),
    },
    {
      title: "Order",
      key: "order",
      render: (record) => (
        <InputNumber
          defaultValue={record.order}
          onChange={(v) => {
            debouncedFetchOrder(parseInt(v), record._id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="default_page">
      <Title
        level={3}
        style={{
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Teachers
      </Title>

      <Button
        type="primary"
        style={{
          alignSelf: "end",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        add Teacher +
      </Button>
      <Table
        columns={columns}
        dataSource={[...teachers].sort(
          (a, b) => (a?.order ?? 999) - (b?.order ?? 999),
        )}
        style={{ marginTop: 24 }}
        rowKey={(record) => record._id}
        expandable={{
          expandedRowRender: (record) => <TeacherExpandable record={record} />,
        }}
        pagination
      />

      <AddTeacher isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
}
