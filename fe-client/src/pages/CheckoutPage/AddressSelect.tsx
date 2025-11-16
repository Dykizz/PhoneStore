import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddressSelect = ({
  label,
  placeholder,
  options,
  error,
  ...props
}: any) => {
  return (
    <div>
      <Label className="text-sm text-gray-600">{label}</Label>
      <Select {...props}>
        <SelectTrigger className="rounded-xl border-gray-200 focus:ring-2 focus:ring-red-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {options?.map((option: any) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default AddressSelect;
