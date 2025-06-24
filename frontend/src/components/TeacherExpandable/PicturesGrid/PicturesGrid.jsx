// {x: 0, y: 0, x2: 0, y2: 0}

import { useState } from "react";
import styles from "./PicturesGrid.module.css";
import Resizable from "../../Resizable/Resizable";
import { Button, message, Spin } from "antd";
import { api } from "../../../lib/api";

const X_CORDS = 3;
const Y_CORDS = 4;

const findFirst = (pictures) => {
  for (let j = 0; j < Y_CORDS; j++) {
    for (let i = 0; i < X_CORDS; i++) {
      if (
        !pictures.find((picture) => {
          const { allY, allX } = countAllCells(picture);
          return allX.includes(i) && allY.includes(j);
        })
      ) {
        return { x: i, y: j };
      }
    }
  }
};

const countAllCells = (picture) => {
  const allY = new Array(picture.y2 - picture.y + 1)
    .fill(0)
    .map((_, i) => picture.y + i);
  const allX = new Array(picture.x2 - picture.x + 1)
    .fill(0)
    .map((_, i) => picture.x + i);
  return { allY, allX };
};

const findAllAvaliable = (pictures) => {
  const result = [];
  for (let j = 0; j < Y_CORDS; j++) {
    for (let i = 0; i < X_CORDS; i++) {
      if (
        !pictures.find((picture) => {
          const { allY, allX } = countAllCells(picture);
          return allX.includes(i) && allY.includes(j);
        })
      ) {
        result.push({ x: i, y: j });
      }
    }
  }
  return result;
};

export default function PicturesGrid({ _id, pictures, setPictures }) {
  const [messageApi, context] = message.useMessage();

  const onAdd = () => {
    const first = findFirst(pictures);
    if (!first) return;
    setPictures([
      ...pictures,
      { ...first, x2: first.x, y2: first.y, _id: Date.now() },
    ]);
  };

  const onResizeRight = (picture) => {
    if (picture.x2 === X_CORDS - 1) return;
    const allAvaliable = findAllAvaliable(pictures);

    const isFree = allAvaliable.find(
      (avaliable) =>
        avaliable.x === picture.x2 + 1 && avaliable.y === picture.y2
    );
    if (!isFree) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, x2: p.x2 + 1 };
        }
        return p;
      })
    );
  };

  const onResizeLeft = (picture) => {
    if (picture.x2 === 0) return;
    const allAvaliable = findAllAvaliable(pictures);
    const isFree = allAvaliable.find(
      (avaliable) => avaliable.x === picture.x - 1 && avaliable.y === picture.y2
    );
    if (!isFree) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, x: p.x - 1 };
        }
        return p;
      })
    );
  };

  const onResizeBot = (picture) => {
    if (picture.y2 === Y_CORDS - 1) return;
    const allAvaliable = findAllAvaliable(pictures);
    const isFree = allAvaliable.find(
      (avaliable) =>
        avaliable.y === picture.y2 + 1 && avaliable.x === picture.x2
    );
    if (!isFree) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, y2: p.y2 + 1 };
        }
        return p;
      })
    );
  };

  const onResizeTop = (picture) => {
    if (picture.y2 === 0) return;
    const allAvaliable = findAllAvaliable(pictures);
    const isFree = allAvaliable.find(
      (avaliable) => avaliable.y === picture.y - 1 && avaliable.x === picture.x2
    );
    if (!isFree) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, y: p.y - 1 };
        }
        return p;
      })
    );
  };

  const onResizeRightBack = (picture) => {
    if (picture.x === picture.x2) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, x2: p.x2 - 1 };
        }
        return p;
      })
    );
  };

  const onResizeLeftBack = (picture) => {
    if (picture.x === picture.x2) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, x: p.x + 1 };
        }
        return p;
      })
    );
  };

  const onResizeBotBack = (picture) => {
    if (picture.y === picture.y2) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, y2: p.y2 - 1 };
        }
        return p;
      })
    );
  };

  const onResizeTopBack = (picture) => {
    if (picture.y === picture.y2) return;
    setPictures(
      pictures.map((p) => {
        if (p._id === picture._id) {
          return { ...p, y: p.y + 1 };
        }
        return p;
      })
    );
  };

  const onDelete = (picture) => {
    setPictures(pictures.filter((p) => p._id !== picture._id));
  };

  console.log(pictures);

  const uploadImage = (e, picture) => {
    const file = e.target.files[0];

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      messageApi.error("Вы можете загружать только JPG/PNG файлы.");
      e.preventDefault();
      return;
    }

    if (file.size / 1024 / 1024 >= 2) {
      messageApi.error("Размер изображения должен быть меньше 2MB.");
      e.preventDefault();
      return;
    }

    setPictures((prev) =>
      prev.map((p) => {
        if (p._id === picture._id) {
          return { ...p, loading: true };
        }
        return p;
      })
    );
    const formData = new FormData();
    formData.append("image", file);

    api
      .post(`/crm/teachers/image/${_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(({ data }) => {
        setPictures((prev) =>
          prev.map((p) => {
            if (p._id === picture._id) {
              return {
                ...p,
                url: import.meta.env.VITE_API + "/public/temp/" + data.file,
                loading: false,
              };
            }
            return p;
          })
        );
      })
      .catch((error) => {
        console.error("Ошибка загрузки файла:", error);
        messageApi.error("Ошибка загрузки файла.");
        setPictures((prev) =>
          prev.map((p) => {
            if (p._id === picture._id) {
              return { ...p, loading: false };
            }
            return p;
          })
        );
      });
  };

  return (
    <>
      {context}
      <Button onClick={onAdd} style={{ margin: "12px 0" }}>
        Додати картинку
      </Button>
      <div className={styles.grid}>
        {pictures.map((picture, index) => (
          <Resizable
            key={index}
            resizeFuncs={{
              onRight: () => onResizeRight(picture),
              onRightBack: () => onResizeRightBack(picture),
              onLeft: () => onResizeLeft(picture),
              onLeftBack: () => onResizeLeftBack(picture),
              onTop: () => onResizeTop(picture),
              onTopBack: () => onResizeTopBack(picture),
              onBot: () => onResizeBot(picture),
              onBotBack: () => onResizeBotBack(picture),
            }}
            onDelete={() => onDelete(picture)}
            style={{
              gridColumn: `${picture.x + 1} / ${picture.x2 + 2}`,
              gridRow: `${picture.y + 1} / ${picture.y2 + 2}`,
              backgroundImage: `url(${picture.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Spin spinning={!!picture.loading}>
              <input
                type="file"
                onChange={(e) => uploadImage(e, picture)}
                accept="image/*"
              />
            </Spin>
          </Resizable>
        ))}
      </div>
    </>
  );
}
