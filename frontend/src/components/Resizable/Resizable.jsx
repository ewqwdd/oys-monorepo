import { useEffect, useRef, useState } from "react";
import styles from "./Resizable.module.css";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function Resizable({
  className,
  children,
  onDelete,
  border = 16,
  width,
  height,
  x,
  y,
  resizeFuncs = {},
  ...props
}) {
  const {
    onRight,
    onLeft,
    onTop,
    onBot,
    onRightBack,
    onLeftBack,
    onTopBack,
    onBotBack,
  } = resizeFuncs;

  const blockRef = useRef(null);
  const [cursor, setCursor] = useState();
  const start = useRef(null);
  const setStart = (value) => (start.current = value);

  const mouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, height, width } =
      blockRef.current.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const isTop = y < border;
    const isLeft = x < border;

    const isBot = y > height - border;
    const isRight = x > width - border;

    if (isTop) {
      setCursor("ns-resize");
    } else if (isBot) {
      setCursor("ns-resize");
    } else if (isLeft) {
      setCursor("ew-resize");
    } else if (isRight) {
      setCursor("ew-resize");
    } else {
      setCursor("default");
    }

    if (!start.current) return;
    if (start.current === "right") {
      const offset = width - x;
      if (Math.abs(offset) > 32) setStart(null);
      if (offset < -32) onRight?.();
      if (offset > 32) onRightBack?.();
    } else if (start.current === "left") {
      const offset = x;
      if (Math.abs(offset) > 32) setStart(null);
      if (offset < -32) onLeft?.();
      if (offset > 32) onLeftBack?.();
    } else if (start.current === "top") {
      const offset = y;
      if (Math.abs(offset) > 32) setStart(null);
      if (offset < -32) onTop?.();
      if (offset > 32) onTopBack?.();
    } else if (start.current === "bot") {
      const offset = height - y;
      if (Math.abs(offset) > 32) setStart(null);
      if (offset < -32) onBot?.();
      if (offset > 32) onBotBack?.();
    }
  };

  const onClick = (e) => {
    const { clientX, clientY } = e;
    const { left, top, height, width } =
      blockRef.current.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const isTop = y < border;
    const isLeft = x < border;

    const isBot = y > height - border;
    const isRight = x > width - border;

    if (isTop) {
      setStart("top");
    } else if (isBot) {
      setStart("bot");
    } else if (isLeft) {
      setStart("left");
    } else if (isRight) {
      setStart("right");
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", mouseMove);
    return () => document.removeEventListener("mousemove", mouseMove);
  }, [resizeFuncs]);

  useEffect(() => {
    window.addEventListener("mouseup", () => setStart(null));
    return () => window.removeEventListener("mouseup", () => setStart(null));
  }, []);

  return (
    <div
      ref={blockRef}
      className={styles.resize + " " + className}
      style={{
        width: width,
        height: height,
        cursor: cursor,
        outlineWidth: border,
        outlineColor: "rgba(0, 0, 0, 0.1)",
        outlineStyle: "solid",
        outlineOffset: -border,
        top: y,
        left: x,
        ...props.style,
      }}
      onMouseDown={onClick}
    >
      <Button className={styles.delete} onClick={onDelete} type="default">
        <DeleteOutlined size={16} />
      </Button>
      {children}
    </div>
  );
}
