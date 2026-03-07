import { useEffect, useState } from "react";
import styles from "../style.module.css";
import clsx from "clsx";
import { verticalDots } from "../../../images";

export default function SortableList({
  startItems,
  className,
  sortResult,
  onChange,
}: {
  startItems: string[];
  sortResult?: number[];
  className?: string;
  onChange?: (sortedItems: string[]) => void;
}) {
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const [grabbedItemIndex, setGrabbedItemIndex] = useState<number | null>(null);
  const [sortedItems, setSortedItems] = useState<string[]>(startItems);

  useEffect(() => {
    function handleGlobalMouseUp() {
      setGrabbedItemIndex(null);
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    if (
      hoveredItemIndex !== null &&
      grabbedItemIndex !== null &&
      hoveredItemIndex !== grabbedItemIndex
    ) {
      swapItems(hoveredItemIndex, grabbedItemIndex);
      setGrabbedItemIndex(hoveredItemIndex);
    }
  }, [hoveredItemIndex, grabbedItemIndex]);
  useEffect(() => {
    if (grabbedItemIndex !== null) {
      document.body.classList.add(styles.grabbingGlobal);
    } else {
      document.body.classList.remove(styles.grabbingGlobal);
    }
    return () => document.body.classList.remove(styles.grabbingGlobal);
  }, [grabbedItemIndex]);
  type MoveDirection = "up" | "down";
  function handleSortChange(
    currentIndex: number,
    moveDirection: MoveDirection,
  ) {
    const indexChange = moveDirection === "up" ? -1 : +1;
    const itemsCount = sortedItems.length;
    const targetIndex = currentIndex + indexChange;
    const targetIndexInBoundry =
      targetIndex < 0 ? itemsCount - 1 : targetIndex % itemsCount;
    swapItems(currentIndex, targetIndexInBoundry);
  }
  function swapItems(itemIndexA: number, itemIndexB: number) {
    if (itemIndexA === itemIndexB) return;
    const updatedSort = [...sortedItems];
    [updatedSort[itemIndexA], updatedSort[itemIndexB]] = [
      updatedSort[itemIndexB],
      updatedSort[itemIndexA],
    ];
    setSortedItems(updatedSort);
    onChange?.(updatedSort);
  }
  return (
    <div className={clsx(styles.sortableList, className)}>
      {sortedItems.map((item, index) => {
        const isCorrect = sortResult && sortResult[index] === index + 1;
        const isBeingDragged = grabbedItemIndex === index;
        return (
          <div
            key={item}
            className={clsx(
              styles.item,
              isBeingDragged && styles.isDragged,
              sortResult && (isCorrect ? styles.correct : styles.incorrect),
            )}
            onMouseEnter={() => setHoveredItemIndex(index)}
            onMouseLeave={() => setHoveredItemIndex(null)}
          >
            <div className={styles.textSection}>
              <img
                onMouseDown={() => setGrabbedItemIndex(index)}
                src={verticalDots}
                draggable="false"
              />
              <div className={styles.sortingIndexContainer}>
                <p className={styles.sortingIndex}>
                  {sortResult ? sortResult[index] : index + 1}
                </p>
              </div>
              <p className={styles.label}>{item}</p>
            </div>
            <div className={styles.buttons}>
              <button
                onClick={() => handleSortChange(index, "up")}
                className={styles.up}
              >
                ▲
              </button>
              <button
                onClick={() => handleSortChange(index, "down")}
                className={styles.down}
              >
                ▼
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
