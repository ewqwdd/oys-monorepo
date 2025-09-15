import React, { useState } from "react";
import { Button, Flex, Image, message } from "antd";
import { api } from "../../lib/api";
import { commonActions } from "../../store/commonReducer";
import { useDispatch } from "react-redux";

export default function UploadPhoto({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [photo, setPhoto] = useState(data.photo);
  const dispatch = useDispatch();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      messageApi.error("Файл не выбран.");
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      messageApi.error("Вы можете загружать только JPG/PNG файлы.");
      return;
    }

    if (file.size / 1024 / 1024 >= 2) {
      messageApi.error("Размер изображения должен быть меньше 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);

    try {
      const response = await api.post(
        `/crm/teachers/image/${data._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      messageApi.success("Файл успешно загружен.");

      setData((prev) => ({
        ...prev,
        photo: response.data.file,
      }));
      setPhoto(import.meta.env.VITE_API + "/public/temp/" + response.data.file);
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(commonActions.logout());
      }
      console.error("Ошибка загрузки файла:", error);
      messageApi.error("Ошибка загрузки файла.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap={8} vertical align="start">
      {contextHolder}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      {data.photo && (
        <Image
          width={200}
          height={200}
          src={photo ?? data.photo}
          alt="Uploaded"
        />
      )}
      {data.photo && (
        <Button
          type="dashed"
          color="danger"
          onClick={() => setData((prev) => ({ ...prev, photo: "" }))}
        >
          Видалити
        </Button>
      )}
    </Flex>
  );
}
