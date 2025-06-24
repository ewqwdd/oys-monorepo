import {
  Button,
  Col,
  Flex,
  Grid,
  Image,
  Input,
  Popconfirm,
  Row,
  Select,
  Spin,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import TeacherAvaliableModal from "../../pages/Teachers/TeacherAvaliableModal";
import { weekDays } from "../../lib/constants/weekDays";
import { useDispatch } from "react-redux";
import { api } from "../../lib/api";
import { commonActions } from "../../store/commonReducer";
import { formatMinutes } from "../../lib/helpers/minutesToString";
import TeacherItem from "./TeacherItem";
import { lvlOptions } from "../../lib/constants/lvlOptions";
import UploadPhoto from "./UploadPhoto";
import { yogaOptions } from "../../lib/constants/yogaOptions";
import PicturesGrid from "./PicturesGrid/PicturesGrid";
import PicturesGridPreview from "../PicturesGridPreview/PicturesGridPreview";
import TeacherEditAvaliableModal from "./TeacherEditAvaliableModal";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const formatOptions = ["Індивідуальні", "Групові"];

export default function TeacherExpandable({ record, isAdmin = true }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(record);
  const dispatch = useDispatch();
  const [pictures, setPictures] = useState(record.pictures ?? []);

  useEffect(() => {
    setIsLoading(true);
    api
      .get("/crm/avaliable", { params: { teacherId: record._id } })
      .then(({ data }) => {
        dispatch(
          commonActions.setAvaliable({ teacherId: record._id, avaliable: data })
        );
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, [record._id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const props = {
    data,
    setData,
    isEditing,
  };

  const cancelEdit = () => {
    setData(record);
    setIsEditing(false);
  };

  const saveEdit = () => {
    setIsLoading(true);
    api
      .post(`/crm/teachers/${record._id}`, { ...data, pictures })
      .then(({ data }) => {
        dispatch(commonActions.editTeacher(data));
        setData(data);
        setPictures(data.pictures);
        setIsEditing(false);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  };

  const deleteTeacher = () => {
    setIsLoading(true);
    api
      .delete(`/crm/teachers/${record._id}`)
      .then(() => {
        dispatch(commonActions.deleteTeacher(record._id));
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <Spin spinning={isLoading}>
      <Flex vertical gap={16}>
        <Flex gap={20}>
          {isEditing ? (
            <UploadPhoto data={data} setData={setData} />
          ) : (
            <Image src={record.photo} width={240} height={240} />
          )}
          <Flex flex={1} vertical justify="space-evenly">
            <TeacherItem {...props} name={"name"} label={"Ім'я"} />
            <TeacherItem {...props} name={"email"} label={"Email"} />
            <TeacherItem {...props} name={"phone"} label={"Телефон"} />
            <TeacherItem {...props} name={"city"} label={"Місто"} />
            <TeacherItem {...props} name={"instagram"} label={"Інстаграм"} />
            <Flex gap={8}>
              <b>Balance: </b>
              <Text>{record.balance}</Text>
            </Flex>
            <TeacherItem {...props} name={"slug"} label={"Slug"} />
          </Flex>
          <Flex vertical gap={8}>
            {isEditing ? (
              <>
                <Button onClick={saveEdit} type="primary">
                  Зберегти
                </Button>
                <Button onClick={cancelEdit}>Скасувати</Button>
              </>
            ) : (
              <>
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  Змінити
                </Button>
                {isAdmin && (
                  <Popconfirm
                    title="Ви впевнені?"
                    onConfirm={deleteTeacher}
                    okText="Так"
                    cancelText="Ні"
                  >
                    <Button type="default">Видалити</Button>
                  </Popconfirm>
                )}
              </>
            )}
          </Flex>
        </Flex>
        <TeacherItem {...props} name={"password"} label={"Пароль"} />
        <TeacherItem
          {...props}
          name={"merchantAccount"}
          label={"Merchant login"}
        />
        <TeacherItem
          {...props}
          name={"merchantSecret"}
          label={"Merchant secret key"}
        />
        <Title level={4} style={{ margin: 0 }}>
          Розклад зайнять
        </Title>
        <TeacherItem
          {...props}
          name={"individual_schedule"}
          label={"Інивідуальні зайняття"}
        />
        <TeacherItem
          {...props}
          name={"group_schedule"}
          label={"Групові зайняття"}
        />
        <Flex gap={8}>
          <b>Рівень: </b>
          {!isEditing ? (
            <Text>{record.lvl?.join(" / ")}</Text>
          ) : (
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              options={lvlOptions}
              onChange={(v) => setData((prev) => ({ ...prev, lvl: v }))}
              value={data.lvl}
            />
          )}
        </Flex>
        <Flex gap={8}>
          <b>Тип: </b>
          {!isEditing ? (
            <Text>{record.type?.join(" / ")}</Text>
          ) : (
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              options={yogaOptions.map((value) => ({ label: value, value }))}
              onChange={(v) => setData((prev) => ({ ...prev, type: v }))}
              value={data.type}
            />
          )}
        </Flex>

        <Flex gap={8}>
          <b>Формат зайнять: </b>
          {!isEditing ? (
            <Text>{record.format?.join(" / ")}</Text>
          ) : (
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              options={formatOptions.map((value) => ({ label: value, value }))}
              onChange={(v) => setData((prev) => ({ ...prev, format: v }))}
              value={data.format}
            />
          )}
        </Flex>

        <TeacherItem
          quill
          vertical
          align="start"
          {...props}
          name={"about"}
          label={"Про себе"}
        />

        <TeacherItem
          textarea
          vertical
          align="start"
          {...props}
          name={"exp"}
          label={"Досвід"}
        />
        <Flex vertical>
          <Flex justify="space-between">
            <Title style={{ margin: 0 }} level={4}>
              Графік роботи:
            </Title>
            <Button onClick={() => setIsModalOpen(true)}>Додати</Button>
          </Flex>
          <Flex gap={8} wrap="wrap" style={{ padding: "12px 0" }}>
            {record.avaliable
              ?.filter((a) => !!a.date && dayjs().isBefore(a.date))
              ?.sort((a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : 1))
              .map((avaliable) => (
                <Button
                  variant="outlined"
                  key={avaliable._id}
                  onClick={() => setIsEditModalOpen(avaliable)}
                >
                  <Text>
                    {dayjs(avaliable.date).format("DD.MM.YYYY")}
                    {" - "}
                    {formatMinutes(avaliable.timeFrom)}
                  </Text>
                </Button>
              ))}
          </Flex>
          <Row justify={"space-evenly"} style={{ marginTop: 24 }}>
            {weekDays.map(({ label, value }) => (
              <Col span={3} key={value}>
                <Flex vertical gap={8}>
                  <Text style={{ textAlign: "center" }}>{label}</Text>
                  {record.avaliable
                    .filter(
                      (avaliable) => avaliable.day === value && !avaliable.date
                    )
                    .sort((a, b) => a.timeFrom - b.timeFrom)
                    .map((avaliable) => (
                      <Button
                        variant="outlined"
                        key={avaliable._id}
                        onClick={() => setIsEditModalOpen(avaliable)}
                      >
                        <Text>
                          {formatMinutes(avaliable.timeFrom)} -{" "}
                          {formatMinutes(avaliable.timeTo)}
                        </Text>
                      </Button>
                    ))}
                </Flex>
              </Col>
            ))}
          </Row>
          {isEditing ? (
            <PicturesGrid
              _id={data._id}
              pictures={pictures}
              setPictures={setPictures}
            />
          ) : (
            <PicturesGridPreview pictures={pictures} />
          )}
        </Flex>
        <TeacherAvaliableModal
          teacherId={record._id}
          open={isModalOpen}
          setOpen={setIsModalOpen}
        />
        <TeacherEditAvaliableModal
          avaliable={isEditModalOpen}
          open={!!isEditModalOpen}
          setOpen={setIsEditModalOpen}
        />
      </Flex>
    </Spin>
  );
}
