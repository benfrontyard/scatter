import { defaultProjectFont } from "@/config/fonts";
import { useAvailableFonts } from "@/hooks/use-available-fonts";
import { loadGoogleFont } from "@/lib/google-fonts";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FontSelectorProps = {
  value: string | undefined;
  onChange: (family: string | undefined) => void;
  label?: string;
  id?: string;
  allowInherit?: boolean;
};

export function FontSelector({
  value,
  onChange,
  label = "Typeface",
  id = "project-font",
  allowInherit = false,
}: FontSelectorProps) {
  const fontGroups = useAvailableFonts();
  const selected = allowInherit ? value || "__inherit__" : value ?? defaultProjectFont;

  return (
    <div className="space-y-1.5">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select
        value={selected}
        onValueChange={(family) => {
          if (family === "__inherit__") {
            onChange(undefined);
            return;
          }
          loadGoogleFont(family);
          onChange(family);
        }}
      >
        <SelectTrigger id={id} className="h-8 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowInherit ? <SelectItem value="__inherit__">Inherit from brand</SelectItem> : null}
          {fontGroups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.fonts.map((family) => (
                <SelectItem key={family} value={family} style={{ fontFamily: family }}>
                  {family}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
