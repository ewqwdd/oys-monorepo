import styles from "./PicturesGridPreview.module.css";

export default function PicturesGridPreview({ pictures }) {
  return (
    <div className={styles.grid}>
      {pictures.map((picture) => (
        <div
          key={picture._id}
          style={{
            gridColumn: `${picture.x + 1} / ${picture.x2 + 2}`,
            gridRow: `${picture.y + 1} / ${picture.y2 + 2}`,
            backgroundImage: `url(${picture.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
    </div>
  );
}
