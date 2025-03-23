const Tag = ({ name, databaseChecked }) => {
    return (
        <span style={{
            display: "inline-block",
            padding: "8px 12px",
            margin: "5px",
            borderRadius: "8px",
            backgroundColor: databaseChecked ? "#007bff" : "#ffcccc",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
        }}>
            {name}
        </span>
    );
};

export default Tag;