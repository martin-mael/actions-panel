interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  focused?: boolean;
}

export function SearchInput({ value, onChange, placeholder = "Filter...", focused = false }: SearchInputProps) {
  return (
    <box style={{ flexDirection: "row", padding: 1 }}>
      <text>
        <span fg="#6b7280">Filter: </span>
      </text>
      <box style={{ border: true, width: 30, height: 3 }}>
        <input
          placeholder={placeholder}
          onInput={onChange}
          focused={focused}
        />
      </box>
    </box>
  );
}
