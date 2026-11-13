import { AutoComplete, Input, type AutoCompleteProps } from 'antd';
import { useMemo, useState } from 'react';
import { suggestEmailDomains } from '../utils/masks';

type Props = Omit<AutoCompleteProps, 'options' | 'onSearch' | 'onChange' | 'children'> & {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  size?: 'large' | 'middle' | 'small';
};

export function EmailSuggestInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'email',
  size = 'large',
  ...rest
}: Props) {
  const [inner, setInner] = useState(value ?? '');
  const current = value ?? inner;

  const options = useMemo(
    () =>
      suggestEmailDomains(current).map((email) => ({
        value: email,
        label: email,
      })),
    [current],
  );

  return (
    <AutoComplete
      {...rest}
      value={current}
      options={options}
      filterOption={false}
      onChange={(next) => {
        setInner(next);
        onChange?.(next);
      }}
    >
      <Input size={size} placeholder={placeholder} autoComplete={autoComplete} />
    </AutoComplete>
  );
}
