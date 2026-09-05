import { Divider, ListItemText, MenuItem, Select, type SelectChangeEvent } from '@mui/material';

export const CLEAR_SELECTION = '__clear__';

type MultiSelectFilterProps = {
  value: string[];
  options: readonly string[];
  placeholder: string;
  onChange: (event: SelectChangeEvent<string[]>) => void;
};

const MultiSelectFilter = ({ value, options, placeholder, onChange }: MultiSelectFilterProps) => (
  <Select
    multiple
    displayEmpty
    value={value}
    onChange={onChange}
    renderValue={(selected) => (selected.length ? selected.join(', ') : placeholder)}
    sx={{
      width: 220,
      '& .MuiSelect-select': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }}
  >
    <MenuItem value={CLEAR_SELECTION} disabled={value.length === 0}>
      <ListItemText primary="Clear all" />
    </MenuItem>
    <Divider />
    {options.map((option) => (
      <MenuItem key={option} value={option}>
        {option}
      </MenuItem>
    ))}
  </Select>
);

export default MultiSelectFilter;
