
const SummaryCard = ({
  title,
  value,
  icon,
  type,
}) => {
  const formattedValue = Number(
    value || 0,
  ).toLocaleString("en-IN");

  const isTransactionCard =
    type === "transactions";

  return (
    <div
      className={`summary-card ${type || ""}`}
    >
      <div className="summary-card-top">
        <span className="summary-title">
          {title}
        </span>

        <span className="summary-icon">
          {icon}
        </span>
      </div>

      <h2>
        {isTransactionCard
          ? formattedValue
          : `₹${formattedValue}`}
      </h2>
    </div>
  );
};

export default SummaryCard;

