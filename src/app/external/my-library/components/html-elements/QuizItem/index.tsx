import clsx from "clsx";
import styles from "./style.module.css";
import Button from "../Button";
import type { QuizData } from "../../../../common/types";

type Props = {
  children?: React.ReactNode;
  className?: string;
  onStartClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  quiz: QuizData;
};
export default function QuizItem({
  quiz,
  children,
  className,
  onStartClick,
  onEditClick,
  onDeleteClick,
}: Props) {
  const title = quiz?.title ?? "error title";
  const briefDescription = quiz?.briefDescription ?? "error description";
  const numberOfQuestions = quiz?.questions.length ?? 24;
  return (
    <div className={clsx(styles.quizItem, className)}>
      <div className={styles.topSection}>
        <p className={styles.title}>
          {title /* .repeat(Math.random() * 10) */}
        </p>
        <p className={styles.description}>
          {briefDescription /* .repeat(Math.random() * 10) */}
        </p>
      </div>
      <div className={styles.bottomSection}>
        <p className={styles.numberOfQuestions}>
          {numberOfQuestions} Questions
        </p>
        <div className={styles.actionButtons}>
          <Button
            styleType="negative"
            size="medium"
            onClick={onDeleteClick}
          >
            Delete
          </Button>
          <Button
            size="medium"
            onClick={onEditClick}
          >
            Edit
          </Button>
          <Button
            styleType="primary"
            size="medium"
            onClick={onStartClick}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
