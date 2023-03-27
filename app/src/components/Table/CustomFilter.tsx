import { MenuItem } from "@mui/material";

/**
 * The possible filter modes for each column type.
 */
type OperatorValue = { name: string; value: string };

const string: OperatorValue[] = [
  { name: "contains", value: "contains" },
  { name: "equals", value: "equals" },
  { name: "not equals", value: "not" },
  { name: "starts with", value: "startsWith" },
  { name: "ends with", value: "endsWith" },
];
const number: OperatorValue[] = [
  { name: "equals", value: "equals" },
  { name: "not equals", value: "not" },
  { name: "greater than", value: "gt" },
  { name: "greater than or equals", value: "gte" },
  { name: "less than", value: "lt" },
  { name: "less than or equals", value: "lte" },
];
const date: OperatorValue[] = [
  { name: "is", value: "equals" },
  { name: "is not", value: "not" },
  { name: "is after", value: "gt" },
  { name: "is on or after", value: "gte" },
  { name: "is before", value: "lt" },
  { name: "is on or before", value: "lte" },
];

const singleSelect: OperatorValue[] = [
  { name: "is", value: "equals" },
  { name: "is not", value: "not" },
];

const multipleSelect: OperatorValue[] = [
  { name: "in", value: "in" },
  { name: "not in", value: "notIn" },
];

/**
 * Returns the corresponding filter mode for a given column type.
 * @param columnType - The type of the column.
 * @returns The filter mode for the given column type.
 */
const insertOperators = (columnType: string): OperatorValue[] => {
  switch (columnType) {
    case "text":
      return string;
    case "number":
      return number;
    case "date":
      return date;
    case "select":
      return singleSelect;
    case "multi-select":
      return multipleSelect;
    default:
      return string;
  }
};

/**
 * FilterModes component
 * Displays a dropdown menu of available filter modes for the given column.
 * @function FilterModes
 * @param column - The column to filter.
 * @param onSelectFilterMode - The callback function to invoke when a filter mode is selected.
 * @returns A list of available filter modes for the given column.
 */
const FilterModes = ({
  column,
  onSelectFilterMode,
}: {
  column: any;
  onSelectFilterMode: (mode: string) => void;
}) => {
  const columnType = column?.columnDef?.filterVariant;
  const operatorValues = insertOperators(columnType);
  return operatorValues?.map((item) => (
    <MenuItem
      key={item?.value}
      onClick={() => onSelectFilterMode(`${item?.value}`)}
    >
      {item?.name}
    </MenuItem>
  ));
};

export default FilterModes;
